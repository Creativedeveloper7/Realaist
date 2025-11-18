Creates, updates, or removes resources. This method supports atomic transactions with multiple types of resources. For example, you can atomically create a campaign and a campaign budget, or perform up to thousands of mutates atomically.

This method is essentially a wrapper around a series of mutate methods. The only features it offers over calling those methods directly are:

Atomic transactions
Temp resource names (described below)
Somewhat reduced latency over making a series of mutate calls
Note: Only resources that support atomic transactions are included, so this method can't replace all calls to individual services.

Atomic Transaction Benefits
Atomicity makes error handling much easier. If you're making a series of changes and one fails, it can leave your account in an inconsistent state. With atomicity, you either reach the chosen state directly, or the request fails and you can retry.

Temp Resource Names
Temp resource names are a special type of resource name used to create a resource and reference that resource in the same request. For example, if a campaign budget is created with resourceName equal to customers/123/campaignBudgets/-1, that resource name can be reused in the Campaign.budget field in the same request. That way, the two resources are created and linked atomically.

To create a temp resource name, put a negative number in the part of the name that the server would normally allocate.

Note:

Resources must be created with a temp name before the name can be reused. For example, the previous CampaignBudget+Campaign example would fail if the mutate order was reversed.
Temp names are not remembered across requests.
There's no limit to the number of temp names in a request.
Each temp name must use a unique negative number, even if the resource types differ.
Latency
It's important to group mutates by resource type or the request may time out and fail. Latency is roughly equal to a series of calls to individual mutate methods, where each change in resource type is a new call. For example, mutating 10 campaigns then 10 ad groups is like 2 calls, while mutating 1 campaign, 1 ad group, 1 campaign, 1 ad group is like 4 calls.

List of thrown errors: AdCustomizerError AdError AdGroupAdError AdGroupCriterionError AdGroupError AssetError AuthenticationError AuthorizationError BiddingError CampaignBudgetError CampaignCriterionError CampaignError CampaignExperimentError CampaignSharedSetError CollectionSizeError ContextError ConversionActionError CriterionError CustomerFeedError DatabaseError DateError DateRangeError DistinctError ExtensionFeedItemError ExtensionSettingError FeedAttributeReferenceError FeedError FeedItemError FeedItemSetError FieldError FieldMaskError FunctionParsingError HeaderError ImageError InternalError KeywordPlanAdGroupKeywordError KeywordPlanCampaignError KeywordPlanError LabelError ListOperationError MediaUploadError MutateError NewResourceCreationError NullError OperationAccessDeniedError PolicyFindingError PolicyViolationError QuotaError RangeError RequestError ResourceCountLimitExceededError SettingError SharedSetError SizeLimitError StringFormatError StringLengthError UrlFieldError UserListError YoutubeVideoRegistrationError

HTTP request
POST https://googleads.googleapis.com/v22/customers/{customerId}/googleAds:mutate

The URL uses gRPC Transcoding syntax.

Path parameters
Parameters
customerId	
string

Required. The ID of the customer whose resources are being modified.

Request body
The request body contains data with the following structure:

JSON representation

{
  "mutateOperations": [
    {
      object (MutateOperation)
    }
  ],
  "partialFailure": boolean,
  "validateOnly": boolean,
  "responseContentType": enum (ResponseContentType)
}
Fields
mutateOperations[]	
object (MutateOperation)

Required. The list of operations to perform on individual resources.

partialFailure	
boolean

If true, successful operations will be carried out and invalid operations will return errors. If false, all operations will be carried out in one transaction if and only if they are all valid. Default is false.

validateOnly	
boolean

If true, the request is validated but not executed. Only errors are returned, not results.

responseContentType	
enum (ResponseContentType)

The response content type setting. Determines whether the mutable resource or just the resource name should be returned post mutation. The mutable resource will only be returned if the resource has the appropriate response field. For example, MutateCampaignResult.campaign.

Response body
Response message for GoogleAdsService.Mutate.

If successful, the response body contains data with the following structure:

JSON representation

{
  "partialFailureError": {
    object (Status)
  },
  "mutateOperationResponses": [
    {
      object (MutateOperationResponse)
    }
  ]
}
Fields
partialFailureError	
object (Status)

Errors that pertain to operation failures in the partial failure mode. Returned only when partialFailure = true and all errors occur inside the operations. If any errors occur outside the operations (for example, auth errors), we return an RPC level error.

mutateOperationResponses[]	
object (MutateOperationResponse)

All responses for the mutate.