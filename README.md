<a name="readme-top"></a>
<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Patch QFX</h3>
  <p align="center">
    Script to patch qfx files payee and memo/note fields.
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This is a quick and dirty script to patch *.qfx files. It will:
* process all *.qfx files in the ~/Downloads folder
* output each file as *-patched.qfx in the ~/Downloads folder
* patch the Payee field based upon a mappings file
* create/update the memo field for bank transactions

Notes:
* All folder locations and filenames can be easily adjusted at the top of the index.js file.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

1. Create a transaction mapping file, `~/Documents/Financial/transaction-mappings.json`.
It is a basic json dictionary, for example:
```json
{
   "AA WINDOW & GUTTER": {"payee": "AA Window & Gutter", "category": "Home"},
   "ADTSECURITY": {"payee": "ADT Security ↺", "category": "Bills & Utilities"},
   "ALASKA AIRLINES": {"payee": "Alaska Airlines", "category": "Travel"},
}
```
where the key is a regular expression that will match on payee or memo/note fields.



### Installation

1. Clone the repo.
   ```sh
   git clone https://github.com/michaelpmaley/patch-qfx.git
   ```

2. Install NPM packages: csv-parser, dayjs, fast-csv, ofx-js, xml2js.
   ```sh
   npm install
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

1. Browse to each financial institution and download the latest transactions in Quicken (qfx) format.

2. In the project folder, run the script.
```sh
   npm run start
```

3. Import each *-patched.qfx file into the financial application.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/michaelpmaley/patch-qfx](https://github.com/michaelpmaley/patch-qfx)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/michaelpmaley/patch-qfx.svg?style=for-the-badge
[contributors-url]: https://github.com/michaelpmaley/patch-qfx/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/michaelpmaley/patch-qfx.svg?style=for-the-badge
[forks-url]: https://github.com/michaelpmaley/patch-qfx/network/members
[stars-shield]: https://img.shields.io/github/stars/michaelpmaley/patch-qfx.svg?style=for-the-badge
[stars-url]: https://github.com/michaelpmaley/patch-qfx/stargazers
[issues-shield]: https://img.shields.io/github/issues/michaelpmaley/patch-qfx.svg?style=for-the-badge
[issues-url]: https://github.com/michaelpmaley/patch-qfx/issues
[license-shield]: https://img.shields.io/github/license/michaelpmaley/patch-qfx.svg?style=for-the-badge
[license-url]: https://github.com/michaelpmaley/patch-qfx/blob/master/LICENSE
