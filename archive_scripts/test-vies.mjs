import fetch from 'node-fetch';

async function testVies() {
  const soapBody = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soap:Body>
    <urn:checkVatApprox>
      <urn:countryCode>RO</urn:countryCode>
      <urn:vatNumber>32585141</urn:vatNumber>
      <urn:requesterCountryCode>RO</urn:requesterCountryCode>
      <urn:requesterVatNumber>32585141</urn:requesterVatNumber>
    </urn:checkVatApprox>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch('http://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
    body: soapBody
  });
  console.log(res.status);
  console.log(await res.text());
}
testVies();
