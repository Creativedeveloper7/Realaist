CampaignOperation

bookmark_border
Spark icon
AI-generated Key Takeaways
A single operation (create, update, remove) on a campaign.

codeProto definition

Fields
update_mask
FieldMask

FieldMask that determines which resource fields are modified in an update.

Union field
operation
operation. The mutate operation. operation can be only one of the following:
create
Campaign

Create operation: No resource name is expected for the new campaign.

update
Campaign

Update operation: The campaign is expected to have a valid resource name.

remove
string

Remove operation: A resource name for the removed campaign is expected, in this format:

customers/{customer_id}/campaigns/{campaign_id}