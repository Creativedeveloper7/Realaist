Creating Transfer Recipients
In a nutshell
To send money from your integration, you need to collect the customer’s details to create a beneficiary.

A transfer recipient is a beneficiary created on your integration to allow you send money. Before sending money from your integration, you need to collect the customer’s details and use their details to create a transfer recipient.

We support the following recipient types:

Type	Description	Currency
ghipss	This means Ghana Interbank Payment and Settlement Systems. It represents bank account in Ghana.	GHS
mobile_money	Mobile Money or MoMo is an account tied to a mobile number.	GHS/KES
kepss	This is the Kenya Electronic Payment and Settlement System. It represents bank accounts in Kenya.	KES
nuban	This means the Nigerian Uniform Bank Account Number. It represents bank accounts in Nigeria.	NGN
basa	This means the Banking Association South Africa. It represents bank accounts in South Africa.	ZAR
authorization	This is a unique code that represents a customer’s card. We return an authorization code after a user makes a payment with their card.	All
To create the transfer recipient, make a POST request to the transfer recipientAPI passing one of the following customer’s detail:

Bank account
Mobile money
Authorization code
Bank account
When creating a transfer recipient with a bank account, you need to collect the customer’s bank details. Typically, the account number and associated bank should suffice, but some countries require more details particularly for account verification. You should design your user interface to allow the collection of the necessary details in the country of operation.

List banks
When creating your user interface (UI) to collect the user’s bank details, you’ll need to populate the UI with a list of banks. We provide a list bankAPI endpoint that you can use to populate your UI with available banks in your country.

To fetch a list of banks in a country, make a GET request passing the currency in the query parameter:


cURL


curl https://api.paystack.co/bank?currency=NGN
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET
{
  "status": true,
  "message": "Banks retrieved",
  "data": [
    {
      "name": "Abbey Mortgage Bank",
      "slug": "abbey-mortgage-bank",
      "code": "801",
      "longcode": "",
      "gateway": null,
      "pay_with_bank": false,
      "active": true,
      "is_deleted": false,
      "country": "Nigeria",
      "currency": "NGN",
      "type": "nuban",
      "id": 174,
      "createdAt": "2020-12-07T16:19:09.000Z",
      "updatedAt": "2020-12-07T16:19:19.000Z"
    }
  ]
}
Ghanaian bank transfer support
At the moment, transfers can't be made to the Bank of Ghana. We recommend that you exclude it from the list of banks as we work on supporting transfers to it.

Verify the account number
You need to collect the destination account number and confirm that it’s valid. This is to ensure you don’t send money to the wrong or invalid account.

As stated earlier, account verification requires different details in different countries. You can follow the process for account verification for the country of operation in the table below:

Currency	Verification
NGN/GHS	Resolve Account Number
ZAR	Validate Account
Create recipient
With the verification completed, you can pass the customer’s bank details and the recipient type to the Create Transfer recipientAPI endpoint:


cURL


curl https://api.paystack.co/transferrecipient
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "type": "nuban", 
      "name": "John Doe", 
      "account_number": "0001234567", 
      "bank_code": "058", 
      "currency": "NGN"
    }'
-X POST
{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2020-05-13T13:59:07.741Z",
    "currency": "NGN",
    "domain": "test",
    "id": 6788170,
    "integration": 428626,
    "name": "John Doe",
    "recipient_code": "RCP_t0ya41mp35flk40",
    "type": "nuban",
    "updatedAt": "2020-05-13T13:59:07.741Z",
    "is_deleted": false,
    "details": {
      "authorization_code": null,
      "account_number": "0001234567",
      "account_name": null,
      "bank_code": "058",
      "bank_name": "Guaranty Trust Bank"
    }
  }
}
Mobile money
Feature availability
This feature is currently available to businesses in Ghana and Kenya.

Mobile money allows a merchant send money to a customer’s mobile number. To start with, you need to collect the customer’s phone number and telco. To fetch a list of supported telcos for mobile money, you can add currency (either KES or GHS) and type in the query parameters for the list bankAPI endpoint:


cURL


curl https://api.paystack.co/bank?currency=GHS&type=mobile_money
-H "Authorization: Bearer YOUR_SECRET_KEY"
-X GET

{
  "status": true,
  "message": "Banks retrieved",
  "data": [
    {
      "name": "AirtelTigo",
      "slug": "atl-mobile-money",
      "code": "ATL",
      "longcode": "",
      "gateway": null,
      "pay_with_bank": false,
      "active": true,
      "is_deleted": null,
      "country": "Ghana",
      "currency": "GHS",
      "type": "mobile_money",
      "id": 29,
      "createdAt": "2018-03-29T12:54:59.000Z",
      "updatedAt": "2020-01-24T10:01:06.000Z"
    },
    {
      "name": "MTN",
      "slug": "mtn-mobile-money",
      "code": "MTN",
      "longcode": "",
      "gateway": null,
      "pay_with_bank": false,
      "active": true,
      "is_deleted": null,
      "country": "Ghana",
      "currency": "GHS",
      "type": "mobile_money",
      "id": 28,
      "createdAt": "2018-03-29T12:54:59.000Z",
      "updatedAt": "2019-10-22T11:04:46.000Z"
    },
    {
      "name": "Vodafone",
      "slug": "vod-mobile-money",
      "code": "VOD",
      "longcode": "",
      "gateway": null,
      "pay_with_bank": false,
      "active": true,
      "is_deleted": null,
      "country": "Ghana",
      "currency": "GHS",
      "type": "mobile_money",
      "id": 66,
      "createdAt": "2018-03-29T12:54:59.000Z",
      "updatedAt": "2019-10-22T11:05:08.000Z"
    }
  ]
}
With the customer’s mobile number, you can then create a recipient by using the telco code as the bank_code and the mobile number as the account_number:


cURL

curl https://api.paystack.co/transferrecipient
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "type": "mobile_money", 
      "name": "Abina Nana", 
      "account_number": "0551234987", 
      "bank_code": "MTN", 
      "currency": "GHS"
    }'
-X POST
{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2022-02-21T12:57:02.156Z",
    "currency": "GHS",
    "domain": "test",
    "id": 25753454,
    "integration": 519035,
    "name": "Abina Nana",
    "recipient_code": "RCP_u2tnoyjjvh95pzm",
    "type": "mobile_money",
    "updatedAt": "2022-02-21T12:57:02.156Z",
    "is_deleted": false,
    "isDeleted": false,
    "details": {
      "authorization_code": null,
      "account_number": "0551234987",
      "account_name": null,
      "bank_code": "MTN",
      "bank_name": "MTN"
    }
  }
}
Kenyan businesses have several mobile money options for the bank_code:

MPESA for individual Mpesa users
MPPAYBILL for Paybill numbers and requires additional information during disbursement
MPTILL for business Till numbers
The recipient type for Paybill and Till numbers is mobile_money_business.


cURL


#!/bin/sh
curl https://api.paystack.co/transferrecipient
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "type": "mobile_money_business",
      "name": "Till Transfer",
      "bank_code": "MPTILL",
      "account_number": "247247",
      "currency": "KES"
    }'
-X POST
{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2024-11-28T09:28:50.000Z",
    "currency": "KES",
    "description": null,
    "domain": "test",
    "email": null,
    "id": 92176030,
    "integration": 845995,
    "metadata": null,
    "name": "Till Transfer Example",
    "recipient_code": "RCP_5vl8b2yma7xdnjp",
    "type": "mobile_money_business",
    "updatedAt": "2024-11-28T09:28:50.000Z",
    "is_deleted": false,
    "isDeleted": false,
    "details": {
      "authorization_code": null,
      "account_number": "247247",
      "account_name": null,
      "bank_code": "MPTILL",
      "bank_name": "M-PESA Till"
    }
  }
}
Authorization code
An authorization code is returned after a successful card payment by a customer. Combining the authorization code with the email address used for payment, you can create a transfer recipient:


cURL


curl https://api.paystack.co/transferrecipient
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ "type": "authorization", 
      "name": "Revs Ore", 
      "email": "revs@ore.com", 
      "authorization_code": "AUTH_ncx8hews93"
    }'
-X POST
{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2022-02-21T11:35:59.302Z",
    "currency": "NGN",
    "domain": "test",
    "email": "revs@ore.com",
    "id": 25747878,
    "integration": 463433,
    "name": "Revs Ore",
    "recipient_code": "RCP_wql6bj95bll7m6h",
    "type": "authorization",
    "updatedAt": "2022-02-21T11:35:59.302Z",
    "is_deleted": false,
    "isDeleted": false,
    "details": {
      "authorization_code": "AUTH_ncx8hews93",
      "account_number": null,
      "account_name": null,
      "bank_code": "057",
      "bank_name": "Zenith Bank"
    }
  }
}
Account Number Association
If an account number isn’t associated with the authorization code, we return a response with a message: Account details not found for this authorization. If you get this error, request the customer's account details and follow the process to create a transfer recipient using a bank account.

Save the recipient code
The recipient_code in the data object of the response is the unique identifier for the customer and would be used to make transfers to the specified account. This code should be saved with the customer’s records in your database.

{
  "status": true,
  "message": "Transfer recipient created successfully",
  "data": {
    "active": true,
    "createdAt": "2022-02-21T11:35:59.302Z",
    "currency": "NGN",
    "domain": "test",
    "email": "revs@ore.com",
    "id": 25747878,
    "integration": 463433,
    "name": "Revs Ore",
    "recipient_code": "RCP_wql6bj95bll7m6h",
    "type": "authorization",
    "updatedAt": "2022-02-21T11:35:59.302Z",
    "is_deleted": false,
    "isDeleted": false,
    "details": {
      "authorization_code": "AUTH_ncx8hews93",
      "account_number": null,
      "account_name": null,
      "bank_code": "057",
      "bank_name": "Zenith Bank"
    }
  }
}