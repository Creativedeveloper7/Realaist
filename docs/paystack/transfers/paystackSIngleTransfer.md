Single Transfers
In a nutshell
Send money to your customers by using the Transfer API

You can transfer money in four easy steps:

Create a transfer recipient
Generate a transfer reference
Initiate a transfer
Listen for transfer status
Before you begin!
To send money on Paystack, you need API keys to authenticate your transfers. You can find your keys on the Paystack Dashboard under Settings → API Keys & Webhooks.

Create a transfer recipient
A transfer recipient is a beneficiary on your integration that you can send money to. Before sending money to your customer, you need to collect their details first, then use their details to create a transfer recipient. We support different recipients in different countries:

Type	Description	Currency
ghipss	This means Ghana Interbank Payment and Settlement Systems. It represents bank account in Ghana.	GHS
mobile_money	Mobile Money or MoMo is an account tied to a mobile number.	GHS/KES
kepss	This is the Kenya Electronic Payment and Settlement System. It represents bank accounts in Kenya.	KES
nuban	This means the Nigerian Uniform Bank Account Number. It represents bank accounts in Nigeria.	NGN
basa	This means the Banking Association South Africa. It represents bank accounts in South Africa.	ZAR
authorization	This is a unique code that represents a customer’s card. We return an authorization code after a user makes a payment with their card.	All
The recipient_code from the data object is the unique identifier for a user and would be used to make transfers to that customer This code should be saved with the customer's records in your database.

Generate a transfer reference
A transfer reference is a unique identifier that lets you track, manage and reconcile each transfer request made on your integration. Transfer references allow you to prevent double crediting as you can retry a non-conclusive transfer rather than initiate a new request.

In order to take advantage of a transfer reference, you need to generate and provide it for every request. We recommend generating a v4 UUID reference of no more than 50 characters. However, here are the constraints to take note of regardless of the logic you decide to implement:

The reference can only contain lowercase letters (a-z), digits (0-9) and these symbols: underscore (_) and dash (_)
The minimum length should be 16 characters
The maximum length should be 50 characters
You can prepend or append special identifiers to the reference to further reduce the chances of collision
JSON
{
  "source": "balance",
  "reason": "Bonus for the week",
  "amount": 100000,
  "recipient": "RCP_gd9vgag7n5lr5ix",
  "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f68"
}
Initiate a transfer
To send money to a customer, you make a POST request to the Initate TransferAPI, passing the reference and recipient_code previously created.

curl https://api.paystack.co/transfer
-H "Authorization: Bearer YOUR_SECRET_KEY"
-H "Content-Type: application/json"
-d '{ 
  "source": "balance",
  "amount": 100000,
  "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f68",
  "recipient": "RCP_gd9vgag7n5lr5ix",
  "reason": "Bonus for the week"
}'
-X POST

{
  "status": true,
  "message": "Transfer has been queued",
  "data": {
    "transfersessionid": [],
    "transfertrials": [],
    "domain": "test",
    "amount": 100000,
    "currency": "NGN",
    "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f68",
    "source": "balance",
    "source_details": null,
    "reason": "Bonus for the week",
    "status": "success",
    "failures": null,
    "transfer_code": "TRF_v5tip3zx8nna9o78",
    "titan_code": null,
    "transferred_at": null,
    "id": 860703114,
    "integration": 463433,
    "request": 1068439313,
    "recipient": 56824902,
    "createdAt": "2025-08-04T10:32:40.000Z",
    "updatedAt": "2025-08-04T10:32:40.000Z"
  }
}
When you send this request, if there are no errors, the response comes back with a pending status, while the transfer is being processed.

Retrying a transfer
If there is an error with the transfer request, you should retry the transaction with the same reference to avoid double crediting. If a new reference is used, the transfer would be treated as a new request.

Test transfers always return success, because there is no processing involved. The live transfers processing usually take between a few seconds and a few minutes. When it's done processing, a notification is sent to your webhook URL.

Verify a transfer
When a transfer is initiated, it could take a few seconds or minutes to be processed. This is why we recommend relying on webhooks for verification as opposed to polling.

Verify via webhooks
Receiving Notifications
In order to receive notifications, you need to implement a webhook URL and set the webhook URL on your Paystack Dashboard.

Once a transfer is processed, we send the final status of the transfer as a POST request to your webhook URL.

Event	Description
transfer.success	This is sent when the transfer is successful

{
  "event": "transfer.success",
  "data": {
    "amount": 100000,
    "createdAt": "2025-08-04T10:32:40.000Z",
    "currency": "NGN",
    "domain": "test",
    "failures": null,
    "id": 860703114,
    "integration": {
      "id": 463433,
      "is_live": true,
      "business_name": "Paystack Demo",
      "logo_path": "https://public-files-paystack-prod.s3.eu-west-1.amazonaws.com/integration-logos/hpyxo8n1c7du6gxup7h6.png"
    },
    "reason": "Bonus for the week",
    "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f68",
    "source": "balance",
    "source_details": null,
    "status": "success",
    "titan_code": null,
    "transfer_code": "TRF_v5tip3zx8nna9o78",
    "transferred_at": null,
    "updatedAt": "2025-08-04T10:32:40.000Z",
    "recipient": {
      "active": true,
      "createdAt": "2023-07-11T15:42:27.000Z",
      "currency": "NGN",
      "description": "",
      "domain": "test",
      "email": null,
      "id": 56824902,
      "integration": 463433,
      "metadata": null,
      "name": "Jekanmo Padie",
      "recipient_code": "RCP_gd9vgag7n5lr5ix",
      "type": "nuban",
      "updatedAt": "2023-07-11T15:42:27.000Z",
      "is_deleted": false,
      "details": {
        "authorization_code": null,
        "account_number": "9876543210",
        "account_name": null,
        "bank_code": "044",
        "bank_name": "Access Bank"
      }
    },
    "session": {
      "provider": null,
      "id": null
    },
    "fee_charged": 0,
    "gateway_response": null
  }
}
transfer.failed	This is sent when the transfer fails

{
  "event": "transfer.failed",
  "data": {
    "amount": 200000,
    "currency": "NGN",
    "domain": "test",
    "failures": null,
    "id": 69123462,
    "integration": {
      "id": 100043,
      "is_live": true,
      "business_name": "Paystack"
    },
    "reason": "Enjoy",
    "reference": "1976435206",
    "source": "balance",
    "source_details": null,
    "status": "failed",
    "titan_code": null,
    "transfer_code": "TRF_chs98y5rykjb47w",
    "transferred_at": null,
    "recipient": {
      "active": true,
      "currency": "NGN",
      "description": null,
      "domain": "test",
      "email": "test@email.com",
      "id": 13584206,
      "integration": 100043,
      "metadata": null,
      "name": "Ted Lasso",
      "recipient_code": "RCP_cjcua8itre45gs",
      "type": "nuban",
      "is_deleted": false,
      "details": {
        "authorization_code": null,
        "account_number": "0123456789",
        "account_name": "Ted Lasso",
        "bank_code": "011",
        "bank_name": "First Bank of Nigeria"
      },
      "created_at": "2021-04-12T15:30:14.000Z",
      "updated_at": "2021-04-12T15:30:14.000Z"
    },
    "session": {
      "provider": "nip",
      "id": "74849400998877667"
    },
    "created_at": "2021-04-12T15:30:15.000Z",
    "updated_at": "2021-04-12T15:41:21.000Z"
  }
}
transfer.reversed	This is sent when we refund a previously debited amount for a transfer that couldn’t be completed
{
  "event": "transfer.reversed",
  "data": {
    "amount": 10000,
    "currency": "NGN",
    "domain": "live",
    "failures": null,
    "id": 20615868,
    "integration": {
      "id": 100073,
      "is_live": true,
      "business_name": "Night's Watch Inc"
    },
    "reason": "test balance ledger elastic changes",
    "reference": "jvrjckwenm",
    "source": "balance",
    "source_details": null,
    "status": "reversed",
    "titan_code": null,
    "transfer_code": "TRF_js075pj9u07f34l",
    "transferred_at": "2020-03-24T07:14:00.000Z",
    "recipient": {
      "active": true,
      "currency": "NGN",
      "description": null,
      "domain": "live",
      "email": "jon@sn.ow",
      "id": 1476759,
      "integration": 100073,
      "metadata": null,
      "name": "JON SNOW",
      "recipient_code": "RCP_hmcj8ciho490bvi",
      "type": "nuban",
      "is_deleted": false,
      "details": {
        "authorization_code": null,
        "account_number": "0000000000",
        "account_name": null,
        "bank_code": "011",
        "bank_name": "First Bank of Nigeria"
      },
      "created_at": "2019-04-10T08:39:10.000Z",
      "updated_at": "2019-11-27T20:43:57.000Z"
    },
    "session": {
      "provider": "nip",
      "id": "110006200324071331002061586801"
    },
    "created_at": "2020-03-24T07:13:31.000Z",
    "updated_at": "2020-03-24T07:14:55.000Z"
  }
}

Verify via polling
If you prefer to use an endpoint to verify the status of the transfer, you can call the Verify TransferAPI endpoint with the transfer reference you used for the request:


cURL
Hide Response

#!/bin/sh
url="https://api.paystack.co/transfer/verify/{reference}"
authorization="Authorization: Bearer YOUR_SECRET_KEY"

curl "$url" -H "$authorization" -X GET
{
  "status": true,
  "message": "Transfer retrieved",
  "data": {
    "amount": 100000,
    "createdAt": "2025-08-04T09:59:19.000Z",
    "currency": "NGN",
    "domain": "test",
    "failures": null,
    "id": 860670817,
    "integration": 463433,
    "reason": "Bonus for the week",
    "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f67",
    "source": "balance",
    "source_details": null,
    "status": "success",
    "titan_code": null,
    "transfer_code": "TRF_8opchtrhtjlfz90n",
    "request": 1068403325,
    "transferred_at": null,
    "updatedAt": "2025-08-04T09:59:19.000Z",
    "recipient": {
      "active": true,
      "createdAt": "2023-07-11T15:42:27.000Z",
      "currency": "NGN",
      "description": "",
      "domain": "test",
      "email": null,
      "id": 56824902,
      "integration": 463433,
      "metadata": null,
      "name": "Jekanmo Padie",
      "recipient_code": "RCP_gd9vgag7n5lr5ix",
      "type": "nuban",
      "updatedAt": "2023-07-11T15:42:27.000Z",
      "is_deleted": false,
      "isDeleted": false,
      "details": {
        "authorization_code": null,
        "account_number": "9876543210",
        "account_name": null,
        "bank_code": "044",
        "bank_name": "Access Bank"
      }
    },
    "session": {
      "provider": null,
      "id": null
    },
    "fee_charged": 1000,
    "fees_breakdown": null,
    "gateway_response": null
  }
}
Verification status
The HTTP status code you get from the API response indicates the status of the API call and not the status of the transfer. The status of the transfer is in the data object of the response, i.e data.status. The status of a transfer should only be updated with the data.status value when you get a 200 status code. Check out the how transfers work page to learn more about handling transfer statuses.