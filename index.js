import xml2js from 'xml2js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

const DOWNLOADSFOLDER = path.join(os.homedir(), 'Downloads');
const MAPPINGSFILE = path.join(os.homedir(), 'Documents', 'Financial', 'transaction-mappings.json');


const ACCOUNTTYPE = {
   BANK: "Checking",
   CREDITCARD: "Credit Card"
};
Object.freeze(ACCOUNTTYPE);


const readOfxFile = ((ofxFile) => {
   const ofxContents = fs.readFileSync(ofxFile).toString();
   const ofxParts = ofxContents.split('<OFX>');
   let ofxHeaders = ofxParts[0].trim();
   let ofxXml = '<OFX>' + ofxParts[1];

   if (ofxHeaders.includes('OFXHEADER:1')) {
      ofxHeaders = '<?xml version="1.0" standalone="no"?><?OFX OFXHEADER="200" VERSION="202" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>';
      ofxXml = ofxXml
         .replace(/>\s+</g, '><')    // remove whitespace inbetween tag close/open
         .replace(/\s+</g, '<')      // remove whitespace before a close tag
         .replace(/>\s+/g, '>')      // remove whitespace after a close tag
         .replace(/<([A-Z0-9_]*)+\.+([A-Z0-9_]*)>([^<]+)/g, '<\$1\$2>\$3' )
         .replace(/<(\w+?)>([^<]+)/g, '<\$1>\$2</\$1>');
   }
   return {ofxHeaders, ofxXml};
});

const parseOfxDate = ((ofxDate) => {
   // 20221003120000[0:GMT]    20221001000000.000[-7:MST]
   const d = ofxDate.slice(0, ofxDate.indexOf('['));
   const z = ofxDate.slice(ofxDate.indexOf('[')+1, ofxDate.indexOf(':'));
   const date = dayjs.utc(d).utcOffset(z);
   return date;
});

const computeInstitution = ((org) => {
   switch (org.toString().toUpperCase()) {
      case 'B1': return 'CHASE';
      default: return org;
   }
});

const computeDefaultCategory = ((type) => {
   return type === 'CREDIT' ? 'Income' : 'Misc Expense';
});

const computeMemo = ((accountType, payee, memoObject) => {
   if (accountType === ACCOUNTTYPE.BANK) {
      if (!memoObject) {
         // check: payee
         return payee;
      } else {
         // debit,credit: payee + memo
         return payee + ' ' + memoObject[0];
      }
   } else {
      return memoObject ? memoObject[0] : ' ';
   }
});

(async () => {
   const mappings = JSON.parse(fs.readFileSync(MAPPINGSFILE).toString());
   const mappingKeys = Object.keys(mappings);

   const folder = DOWNLOADSFOLDER;
   for (const file of fs.readdirSync(folder)) {
      if (!file.toLowerCase().endsWith('.qfx') || file.toLowerCase().includes('patched')) {
         console.log(`SKIPPING: ${file}`);
         continue;
      }

      // 1. read ofx file
      const {ofxHeaders, ofxXml} = readOfxFile(path.join(folder, file));

      // 2. convert xml to json
      const parser = new xml2js.Parser();
      const ofxData = await parser.parseStringPromise(ofxXml);
      const institution = computeInstitution(ofxData.OFX.SIGNONMSGSRSV1[0].SONRS[0].FI[0].ORG[0]);
      const accountType = ofxData.OFX.BANKMSGSRSV1 ? ACCOUNTTYPE.BANK : ACCOUNTTYPE.CREDITCARD;
      const statement = accountType === ACCOUNTTYPE.BANK ? ofxData.OFX.BANKMSGSRSV1[0].STMTTRNRS[0].STMTRS[0] : ofxData.OFX.CREDITCARDMSGSRSV1[0].CCSTMTTRNRS[0].CCSTMTRS[0];
      const accountId = accountType === ACCOUNTTYPE.BANK ? statement.BANKACCTFROM[0].ACCTID[0] : statement.CCACCTFROM[0].ACCTID[0];
      const dateStart = parseOfxDate(statement.BANKTRANLIST[0].DTSTART[0]);
      const dateEnd = parseOfxDate(statement.BANKTRANLIST[0].DTEND[0]);
      const ofxTransactions = statement.BANKTRANLIST[0].STMTTRN;

      // 3. process transactions
      for (const ofxTransaction of ofxTransactions) {
         let payee = ofxTransaction.NAME[0];
         let category = computeDefaultCategory(ofxTransaction.TRNTYPE[0]);
         const memo = computeMemo(accountType, ofxTransaction.NAME[0], ofxTransaction.MEMO);

         // 3.a. remap payee and category
         mappingKeys.find(mappingKey => {
            const re = new RegExp(mappingKey);
            if (re.test(payee) || re.test(memo)) {
               payee = mappings[mappingKey].payee;
               category = mappings[mappingKey].category;
            }
         });

         // 3.b. update transaction
         ofxTransaction.NAME = [];
         ofxTransaction.NAME.push(payee);
         // FUTURE
         //delete ofxTransaction.NAME;
         //ofxTransaction["PAYEE"] = new Array();
         //ofxTransaction.PAYEE.push(payee);
         //ofxTransaction["EXTDNAME"] = new Array();
         //ofxTransaction.EXTDNAME.push(category);
         ofxTransaction.MEMO = [];
         ofxTransaction.MEMO.push(memo);
      }

      // 4. convert json to xml
      const builder = new xml2js.Builder();
      let ofxXmlPatched = builder.buildObject(ofxData);
      ofxXmlPatched = ofxXmlPatched.replace('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', ofxHeaders);

      // 5. save patched qfx file
      const ofxFilePatched = path.join(folder, `${institution}-${dateStart.format('YYYYMMDD')}-${dateEnd.format('YYYYMMDD')}-patched.qfx`);
      fs.writeFileSync(ofxFilePatched, ofxXmlPatched);
   }
})();
