const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const NodeXls = require('node-xls');
const tool = new NodeXls();

const URL = 'https://www.bizbaya.com';
const getURI = (page) => URL + '/sme-india/rajasthan/jaipur?page=' + page;
const lastPage = 7;

const companies = [];

async function fetchCompanies() {
  for (let index = 1; index <= lastPage; index++) {
    await fetchData(getURI(index)).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      const links = $('.views-field-company-name >p >a');
      links.each(function (i) {
        let subLink = $(this).attr('href');
        fetchData(URL + subLink).then((page) => {
          const html = page.data;
          const $ = cheerio.load(html);
          companies.push({
            company: $('.views-field-company-name > .field-content').text(),
            directors: $('.views-field-directors > .field-content').text(),
            mobile: $('.views-field-mobile > .field-content').text(),
            telephone: $('.views-field-telephone > .field-content').text(),
            email: $('.views-field-email > .field-content').text(),
            address: $('.views-field-address > .field-content').text(),
            pinCode: $('.views-field-pin > .field-content').text().substr(0, 6),
            products: $(
              '.views-field-products-services > .field-content'
            ).text(),
          });

          if (i === links.length - 1 && index === lastPage) {
            const xls = tool.json2xls(companies);
            fs.writeFileSync('companies.xlsx', xls, 'binary');
          }
        });
      });
    });
  }
}

async function fetchData(url) {
  let response = await axios(url).catch((err) => console.log(err));
  if (response.status !== 200) {
    console.log('Error occurred while fetching data');
    return;
  }
  return response;
}

fetchCompanies();
