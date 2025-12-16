import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePropertyTypes() {
  try {
    console.log('Starting property type updates...');

    // Update Apartment Complex to Apartment
    const { data: aptData, error: aptError } = await supabase
      .from('properties')
      .update({ property_type: 'Apartment' })
      .eq('property_type', 'Apartment Complex');

    if (aptError) throw aptError;
    console.log(`Updated ${aptData?.length || 0} properties from 'Apartment Complex' to 'Apartment'`);

    // Update Townhouse Complex to Townhouse
    const { data: townhouseData, error: townhouseError } = await supabase
      .from('properties')
      .update({ property_type: 'Townhouse' })
      .eq('property_type', 'Townhouse Complex');

    if (townhouseError) throw townhouseError;
    console.log(`Updated ${townhouseData?.length || 0} properties from 'Townhouse Complex' to 'Townhouse'`);

    // Update Studio Complex to Studio
    const { data: studioData, error: studioError } = await supabase
      .from('properties')
      .update({ property_type: 'Studio' })
      .eq('property_type', 'Studio Complex');

    if (studioError) throw studioError;
    console.log(`Updated ${studioData?.length || 0} properties from 'Studio Complex' to 'Studio'`);

    console.log('Property type updates completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating property types:', error);
    process.exit(1);
  }
}

updatePropertyTypes();
