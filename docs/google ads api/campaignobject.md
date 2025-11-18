Campaign

bookmark_border
Spark icon
AI-generated Key Takeaways
A campaign.

codeProto definition

Fields
resource_name
string

Immutable. The resource name of the campaign. Campaign resource names have the form:

customers/{customer_id}/campaigns/{campaign_id}

primary_status
CampaignPrimaryStatus

Output only. The primary status of the campaign.

Provides insight into why a campaign is not serving or not serving optimally. Modification to the campaign and its related entities might take a while to be reflected in this status.

primary_status_reasons[]
CampaignPrimaryStatusReason

Output only. The primary status reasons of the campaign.

Provides insight into why a campaign is not serving or not serving optimally. These reasons are aggregated to determine an overall CampaignPrimaryStatus.

status
CampaignStatus

The status of the campaign.

When a new campaign is added, the status defaults to ENABLED.

serving_status
CampaignServingStatus

Output only. The ad serving status of the campaign.

bidding_strategy_system_status
BiddingStrategySystemStatus

Output only. The system status of the campaign's bidding strategy.

ad_serving_optimization_status
AdServingOptimizationStatus

The ad serving optimization status of the campaign.

advertising_channel_type
AdvertisingChannelType

Immutable. The primary serving target for ads within the campaign. The targeting options can be refined in network_settings.

This field is required and should not be empty when creating new campaigns.

Can be set only when creating campaigns. After the campaign is created, the field can not be changed.

advertising_channel_sub_type
AdvertisingChannelSubType

Immutable. Optional refinement to advertising_channel_type. Must be a valid sub-type of the parent channel type.

Can be set only when creating campaigns. After campaign is created, the field can not be changed.

url_custom_parameters[]
CustomParameter

The list of mappings used to substitute custom parameter tags in a tracking_url_template, final_urls, or mobile_final_urls.

local_services_campaign_settings
LocalServicesCampaignSettings

The Local Services Campaign related settings.

travel_campaign_settings
TravelCampaignSettings

Settings for Travel campaign.

demand_gen_campaign_settings
DemandGenCampaignSettings

Settings for Demand Gen campaign.

video_campaign_settings
VideoCampaignSettings

Settings for Video campaign.

pmax_campaign_settings
PmaxCampaignSettings

Settings for Performance Max campaign.

real_time_bidding_setting
RealTimeBiddingSetting

Settings for Real-Time Bidding, a feature only available for campaigns targeting the Ad Exchange network.

network_settings
NetworkSettings

The network settings for the campaign.

hotel_setting
HotelSettingInfo

Immutable. The hotel setting for the campaign.

dynamic_search_ads_setting
DynamicSearchAdsSetting

The setting for controlling Dynamic Search Ads (DSA).

shopping_setting
ShoppingSetting

The setting for controlling Shopping campaigns.

targeting_setting
TargetingSetting

Setting for targeting related features.

geo_target_type_setting
GeoTargetTypeSetting

The setting for ads geotargeting.

local_campaign_setting
LocalCampaignSetting

The setting for local campaign.

app_campaign_setting
AppCampaignSetting

The setting related to App Campaign.

labels[]
string

Output only. The resource names of labels attached to this campaign.

experiment_type
CampaignExperimentType

Output only. The type of campaign: normal, draft, or experiment.

bidding_strategy_type
BiddingStrategyType

Output only. The type of bidding strategy.

A bidding strategy can be created by setting either the bidding scheme to create a standard bidding strategy or the bidding_strategy field to create a portfolio bidding strategy.

This field is read-only.

accessible_bidding_strategy
string

Output only. Resource name of AccessibleBiddingStrategy, a read-only view of the unrestricted attributes of the attached portfolio bidding strategy identified by 'bidding_strategy'. Empty, if the campaign does not use a portfolio strategy. Unrestricted strategy attributes are available to all customers with whom the strategy is shared and are read from the AccessibleBiddingStrategy resource. In contrast, restricted attributes are only available to the owner customer of the strategy and their managers. Restricted attributes can only be read from the BiddingStrategy resource.

frequency_caps[]
FrequencyCapEntry

A list that limits how often each user will see this campaign's ads.

video_brand_safety_suitability
BrandSafetySuitability

Brand Safety setting at the individual campaign level. Allows for selecting an inventory type to show your ads on content that is the right fit for your brand. See https://support.google.com/google-ads/answer/7515513.

vanity_pharma
VanityPharma

Describes how unbranded pharma ads will be displayed.

selective_optimization
SelectiveOptimization

Selective optimization setting for this campaign, which includes a set of conversion actions to optimize this campaign towards. This feature only applies to app campaigns that use MULTI_CHANNEL as AdvertisingChannelType and APP_CAMPAIGN or APP_CAMPAIGN_FOR_ENGAGEMENT as AdvertisingChannelSubType.

optimization_goal_setting
OptimizationGoalSetting

Optimization goal setting for this campaign, which includes a set of optimization goal types.

tracking_setting
TrackingSetting

Output only. Campaign-level settings for tracking information.

payment_mode
PaymentMode

Payment mode for the campaign.

excluded_parent_asset_field_types[]
AssetFieldType

The asset field types that should be excluded from this campaign. Asset links with these field types will not be inherited by this campaign from the upper level.

excluded_parent_asset_set_types[]
AssetSetType

The asset set types that should be excluded from this campaign. Asset set links with these types will not be inherited by this campaign from the upper level. Location group types (GMB_DYNAMIC_LOCATION_GROUP, CHAIN_DYNAMIC_LOCATION_GROUP, and STATIC_LOCATION_GROUP) are child types of LOCATION_SYNC. Therefore, if LOCATION_SYNC is set for this field, all location group asset sets are not allowed to be linked to this campaign, and all Location Extension (LE) and Affiliate Location Extensions (ALE) will not be served under this campaign. Only LOCATION_SYNC is currently supported.

performance_max_upgrade
PerformanceMaxUpgrade

Output only. Information about campaigns being upgraded to Performance Max.

asset_automation_settings[]
AssetAutomationSetting

Contains the opt-in/out status of each AssetAutomationType. See documentation of each asset automation type enum for default opt in/out behavior.

keyword_match_type
CampaignKeywordMatchType

Keyword match type of Campaign. Set to BROAD to set broad matching for all keywords in a campaign.

brand_guidelines
BrandGuidelines

These settings control how your brand appears in automatically generated assets and formats within this campaign. Note: These settings can only be used for Performance Max campaigns that have Brand Guidelines enabled.

third_party_integration_partners
CampaignThirdPartyIntegrationPartners

Third-Party integration partners.

ai_max_setting
AiMaxSetting

Settings for AI Max in search campaigns.

contains_eu_political_advertising
EuPoliticalAdvertisingStatus

The advertiser should self-declare whether this campaign contains political advertising content targeted towards the European Union.

feed_types[]
AssetSetType

Output only. Types of feeds that are attached directly to this campaign.

id
int64

Output only. The ID of the campaign.

name
string

The name of the campaign.

This field is required and should not be empty when creating new campaigns.

It must not contain any null (code point 0x0), NL line feed (code point 0xA) or carriage return (code point 0xD) characters.

tracking_url_template
string

The URL template for constructing a tracking URL.

audience_setting
AudienceSetting

Immutable. Setting for audience related features.

base_campaign
string

Output only. The resource name of the base campaign of a draft or experiment campaign. For base campaigns, this is equal to resource_name.

This field is read-only.

campaign_budget
string

The resource name of the campaign budget of the campaign.

start_date
string

The date when campaign started in serving customer's timezone in YYYY-MM-DD format.

campaign_group
string

The resource name of the campaign group that this campaign belongs to.

end_date
string

The last day of the campaign in serving customer's timezone in YYYY-MM-DD format. On create, defaults to 2037-12-30, which means the campaign will run indefinitely. To set an existing campaign to run indefinitely, set this field to 2037-12-30.

final_url_suffix
string

Suffix used to append query parameters to landing pages that are served with parallel tracking.

optimization_score
double

Output only. Optimization score of the campaign.

Optimization score is an estimate of how well a campaign is set to perform. It ranges from 0% (0.0) to 100% (1.0), with 100% indicating that the campaign is performing at full potential. This field is null for unscored campaigns.

See "About optimization score" at https://support.google.com/google-ads/answer/9061546.

This field is read-only.

hotel_property_asset_set
string

Immutable. The resource name for a set of hotel properties for Performance Max for travel goals campaigns.

listing_type
ListingType

Immutable. Listing type of ads served for this campaign. Field is restricted for usage with Performance Max campaigns.

brand_guidelines_enabled
bool

Immutable. Whether Brand Guidelines are enabled for this Campaign. Only applicable to Performance Max campaigns. If enabled, business name and logo assets must be linked as CampaignAssets instead of AssetGroupAssets.

Writable only at campaign creation. Set to true to enable Brand Guidelines when creating a new Performance Max campaign.

Immutable after creation. This field cannot be modified using standard update operations after the campaign has been created.

For existing campaigns: To enable Brand Guidelines on a campaign after it has been created, use the CampaignService.EnablePMaxBrandGuidelines method, which is a separate operation. It is not possible to disable Brand Guidelines for an existing campaign.

Incompatible with Travel Goals: This feature is not supported for Performance Max campaigns with Travel Goals. Attempting to set this field to true for a Travel Goals campaign will result in an error.

campaign_bidding_strategy
Union field campaign_bidding_strategy. The bidding strategy for the campaign.

campaign_bidding_strategy. The bidding strategy for the campaign.
Must be either portfolio (created through BiddingStrategy service) or standard, that is embedded into the campaign. campaign_bidding_strategy can be only one of the following:

campaign_bidding_strategy can be only one of the following:
bidding_strategy
string

The resource name of the portfolio bidding strategy used by the campaign.

commission
Commission

Commission is an automatic bidding strategy in which the advertiser pays a certain portion of the conversion value.

manual_cpa
ManualCpa

Standard Manual CPA bidding strategy. Manual bidding strategy that allows advertiser to set the bid per advertiser-specified action. Supported only for Local Services campaigns.

manual_cpc
ManualCpc

Standard Manual CPC bidding strategy. Manual click-based bidding where user pays per click.

manual_cpm
ManualCpm

Standard Manual CPM bidding strategy. Manual impression-based bidding where user pays per thousand impressions.

manual_cpv
ManualCpv

A bidding strategy that pays a configurable amount per video view.

maximize_conversions
MaximizeConversions

Standard Maximize Conversions bidding strategy that automatically maximizes number of conversions while spending your budget.

maximize_conversion_value
MaximizeConversionValue

Standard Maximize Conversion Value bidding strategy that automatically sets bids to maximize revenue while spending your budget.

target_cpa
TargetCpa

Standard Target CPA bidding strategy that automatically sets bids to help get as many conversions as possible at the target cost-per-acquisition (CPA) you set.

target_impression_share
TargetImpressionShare

Target Impression Share bidding strategy. An automated bidding strategy that sets bids to achieve a chosen percentage of impressions.

target_roas
TargetRoas

Standard Target ROAS bidding strategy that automatically maximizes revenue while averaging a specific target return on ad spend (ROAS).

target_spend
TargetSpend

Standard Target Spend bidding strategy that automatically sets your bids to help get as many clicks as possible within your budget.

percent_cpc
PercentCpc

Standard Percent Cpc bidding strategy where bids are a fraction of the advertised price for some good or service.

target_cpm
TargetCpm

A bidding strategy that automatically optimizes cost per thousand impressions.

fixed_cpm
FixedCpm

A manual bidding strategy with a fixed CPM.

target_cpv
TargetCpv

An automated bidding strategy that sets bids to optimize performance given the target CPV you set.

target_cpc
TargetCpc

An automated bidding strategy that sets bids to help get as many clicks as possible at the target cost-per-click (CPC) you set.