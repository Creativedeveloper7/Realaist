import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Upload, 
  MapPin, 
  DollarSign, 
  Building2, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { propertiesService, CreatePropertyData, Property } from '../services/propertiesService';
import { storageService } from '../services/storageService';

interface PropertyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onPropertyCreated?: () => void;
  editingProperty?: Property | null;
}

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  units: number;
  status: 'active' | 'draft' | 'pending';
  images: File[];
  amenities: string[];
  features: string[];
  // Land-specific
  landSize?: number;
  landUnit?: 'Acres' | 'Hectares' | '';
}

export const PropertyUploadModal: React.FC<PropertyUploadModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onPropertyCreated,
  editingProperty
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    units: 1,
    status: 'active',
    images: [],
    amenities: [],
    features: [],
    landSize: 0,
    landUnit: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newAmenity, setNewAmenity] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isLand = formData.propertyType === 'Land';

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('PropertyUploadModal: Resetting states on open');
      // Force reset all states
      setIsSubmitting(false);
      setSubmitStatus('idle');
      setErrorMessage('');
      setCurrentStep(1);
      
      // Also reset form data to ensure clean state
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        propertyType: '',
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        units: 1,
        status: 'active',
        images: [],
        amenities: [],
        features: [],
        landSize: 0,
        landUnit: ''
      });
    }
  }, [isOpen]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('PropertyUploadModal: isSubmitting changed to:', isSubmitting);
  }, [isSubmitting]);

  // Safety net: Force reset isSubmitting if it gets stuck
  useEffect(() => {
    if (isSubmitting) {
      console.log('PropertyUploadModal: isSubmitting is true, setting safety timeout');
      const timeout = setTimeout(() => {
        console.log('PropertyUploadModal: Safety timeout triggered, resetting isSubmitting');
        setIsSubmitting(false);
        setSubmitStatus('error');
        setErrorMessage('The request took too long. Please check your connection and try again.');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isSubmitting]);

  // Pre-fill form when editing a property
  useEffect(() => {
    if (editingProperty && isOpen) {
      console.log('PropertyUploadModal: Pre-filling form for editing property:', editingProperty);
      const landBackfill = editingProperty.propertyType === 'Land' && editingProperty.squareFeet
        ? { landSize: Math.round((editingProperty.squareFeet / 43560) * 100) / 100, landUnit: 'Acres' as const }
        : { landSize: 0, landUnit: '' as const };
      setFormData({
        title: editingProperty.title,
        description: editingProperty.description,
        price: editingProperty.price.toString(),
        location: editingProperty.location,
        propertyType: editingProperty.propertyType,
        bedrooms: (editingProperty.bedrooms as number) || 0,
        bathrooms: (editingProperty.bathrooms as number) || 0,
        area: (editingProperty.squareFeet as number) || 0,
        images: [], // Will be handled separately for existing images
        amenities: editingProperty.amenities || [],
        features: editingProperty.features || [],
        units: 1,
        status: 'active',
        ...landBackfill
      });
    }
  }, [editingProperty, isOpen]);

  const propertyTypes = [
    'Apartment Complex',
    'Villa Development',
    'Townhouse Complex',
    'Penthouse',
    'Studio Complex',
    'Commercial Building',
    'Mixed Use Development',
    'Off-plan',
    'Land'
  ];

  const commonAmenities = [
    'Swimming Pool',
    'Gym/Fitness Center',
    'Parking',
    'Security',
    'Garden/Landscaping',
    'Playground',
    'Clubhouse',
    'Elevator',
    'Balcony',
    'Air Conditioning'
  ];

  const landAmenities = [
    'Near School',
    'Near Hospital',
    'Near Shopping Center',
    'Near Tarmac Road',
    'Public Transport Access',
    'Proximity to CBD',
    'Scenic Views',
    'Near Water Source',
    'Near Electricity Grid',
    'Gentle Terrain',
    'Ready Title Deed',
    'Beacons Placed'
  ];

  const commonFeatures = [
    'Modern Kitchen',
    'Hardwood Floors',
    'Granite Countertops',
    'Walk-in Closet',
    'Fireplace',
    'High Ceilings',
    'Natural Light',
    'Built-in Storage',
    'Energy Efficient',
    'Smart Home Features'
  ];

  const landFeatures = [
    'Water Connection',
    'Electricity',
    'All-Weather Road Access',
    'Gated',
    'Fenced',
    'Street Lighting',
    'Sewer Connection',
    'Internet Availability'
  ];

  const amenitiesOptions = isLand ? landAmenities : commonAmenities;
  const featuresOptions = isLand ? landFeatures : commonFeatures;

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach(file => {
      const validation = storageService.validateImageFile(file, 10); // 10MB max
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    if (errors.length > 0) {
      setErrorMessage(errors.join(', '));
      setSubmitStatus('error');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PropertyUploadModal: Form submitted, isSubmitting:', isSubmitting, 'currentStep:', currentStep);
    
    // Only allow submission on step 3
    if (currentStep !== 3) {
      console.log('PropertyUploadModal: Form submitted but not on step 3, ignoring');
      return;
    }
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('PropertyUploadModal: Already submitting, ignoring');
      return;
    }
    
    // Check if required fields are filled
    if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.propertyType) {
      console.log('PropertyUploadModal: Required fields missing, not submitting');
      setErrorMessage('Please fill in all required fields');
      setSubmitStatus('error');
      return;
    }
    
    // For land, land size and unit are required
    if (isLand && (!formData.landSize || !formData.landUnit)) {
      setErrorMessage('Please provide land size and unit (acres/hectares)');
      setSubmitStatus('error');
      return;
    }
    
    if (editingProperty) {
      console.log('PropertyUploadModal: Starting property update...');
    } else {
      console.log('PropertyUploadModal: Starting property creation...');
    }
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Parse price (remove currency symbols and commas)
      const numericPrice = parseFloat(formData.price.replace(/[$,]/g, ''));
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error('Please enter a valid price');
      }

      // Compute square feet if land
      let computedSquareFeet: number | undefined = undefined;
      if (isLand && formData.landSize && formData.landUnit) {
        if (formData.landUnit === 'Acres') {
          computedSquareFeet = formData.landSize * 43560;
        } else if (formData.landUnit === 'Hectares') {
          computedSquareFeet = formData.landSize * 107639;
        }
      }
      // Round to integer for DB column (integer)
      if (computedSquareFeet !== undefined) {
        computedSquareFeet = Math.round(computedSquareFeet);
      }

      let property;
      let propertyError;

      if (editingProperty) {
        // Update existing property
        const updateData = {
          id: editingProperty.id,
          title: formData.title,
          description: formData.description,
          price: numericPrice,
          location: formData.location,
          propertyType: formData.propertyType,
          bedrooms: isLand ? undefined : (formData.bedrooms || undefined),
          bathrooms: isLand ? undefined : (formData.bathrooms || undefined),
          squareFeet: isLand ? computedSquareFeet : (formData.area || undefined),
          amenities: formData.amenities,
          features: formData.features
        };

        const result = await propertiesService.updateProperty(updateData);
        property = result.property;
        propertyError = result.error;
      } else {
        // Create new property
        const propertyData: CreatePropertyData = {
          title: formData.title,
          description: formData.description,
          price: numericPrice,
          location: formData.location,
          propertyType: formData.propertyType,
          bedrooms: isLand ? undefined : (formData.bedrooms || undefined),
          bathrooms: isLand ? undefined : (formData.bathrooms || undefined),
          squareFeet: isLand ? computedSquareFeet : (formData.area || undefined),
          status: formData.status.toLowerCase() as 'active' | 'draft' | 'pending',
          images: [], // Will be populated after upload
          amenities: formData.amenities,
          features: formData.features
        };

        console.log('PropertyUploadModal: Payload being sent to createProperty:', propertyData);
        const result = await propertiesService.createProperty(propertyData);
        console.log('PropertyUploadModal: createProperty result:', result);
        property = result.property;
        propertyError = result.error;
      }
      
      if (propertyError || !property) {
        console.error('PropertyUploadModal: Error from service:', propertyError);
        setSubmitStatus('error');
        setErrorMessage(propertyError || 'No property returned from server');
        throw new Error(propertyError || (editingProperty ? 'Failed to update property' : 'Failed to create property'));
      }

      // Upload images if any
      const imageUrls: string[] = [];
      if (formData.images.length > 0) {
        for (const imageFile of formData.images) {
          try {
            // Compress image before upload
            const compressedImage = await storageService.compressImage(imageFile, 1920, 0.8);
            const { url, error: uploadError } = await storageService.uploadPropertyImage(compressedImage, property.id);
            
            if (uploadError || !url) {
              console.warn(`Failed to upload image ${imageFile.name}:`, uploadError);
              continue;
            }
            
            imageUrls.push(url);
          } catch (uploadError) {
            console.warn(`Error uploading image ${imageFile.name}:`, uploadError);
            continue;
          }
        }

        // Update property with image URLs
        if (imageUrls.length > 0) {
          await propertiesService.updateProperty({
            id: property.id,
            images: imageUrls
          });
        }
      }

      setSubmitStatus('success');
      console.log(`PropertyUploadModal: Property ${editingProperty ? 'updated' : 'created'} successfully:`, property);
      
      // Broadcast to listeners for immediate UI updates
      try {
        window.dispatchEvent(new CustomEvent('realaist:property-created', { detail: { property } }));
      } catch {}
      
      // Call the callback to refresh the properties list
      if (onPropertyCreated) {
        console.log('PropertyUploadModal: Calling onPropertyCreated callback');
        onPropertyCreated();
      }
      
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          location: '',
          propertyType: '',
          bedrooms: 0,
          bathrooms: 0,
          area: 0,
          units: 1,
          status: 'active',
          images: [],
          amenities: [],
          features: [],
          landSize: 0,
          landUnit: ''
        });
        setCurrentStep(1);
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 2000);

    } catch (error) {
      console.error('Error uploading property:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  console.log('PropertyUploadModal: Rendering modal, isSubmitting:', isSubmitting);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10 bg-inherit rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <p className="text-gray-600 mt-1">Step {currentStep} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg:white/10 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-[#C7A667] text-black' 
                      : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-[#C7A667]' : 'bg-gray-200 dark:bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6" onKeyDown={(e) => {
          // Prevent form submission on Enter key
          if (e.key === 'Enter' && e.target !== e.currentTarget) {
            e.preventDefault();
            console.log('PropertyUploadModal: Enter key pressed, preventing form submission');
          }
        }}>
          {/* Status Messages */}
          {submitStatus === 'success' && (
            <motion.div
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Property {editingProperty ? 'updated' : 'created'} successfully! Redirecting...
              </span>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <div>
                <span className="text-red-800 dark:text-red-200 font-medium block">
                  Error creating property
                </span>
                {errorMessage && (
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    {errorMessage}
                  </span>
                )}
              </div>
            </motion.div>
          )}
          {/* Debug: Show current state */}
          {import.meta.env.DEV && (
            <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs">
              <strong>Debug Info:</strong> isSubmitting: {isSubmitting.toString()}, 
              submitStatus: {submitStatus}, currentStep: {currentStep}
              {isSubmitting && (
                <button
                  onClick={() => {
                    console.log('PropertyUploadModal: Manual reset triggered');
                    setIsSubmitting(false);
                    setSubmitStatus('idle');
                    setErrorMessage('');
                  }}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Reset State
                </button>
              )}
            </div>
          )}
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="text-xl font-bold mb-4">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    placeholder="e.g., Luxury Apartments - Westlands"
                  />
                </div>

                <div>
                  <label className="block text sm font-medium mb-2">Property Type *</label>
                  <select
                    required
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                  >
                    <option value="">Select Property Type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Units OR Land Size */}
                {!isLand ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Units</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.units}
                      onChange={(e) => handleInputChange('units', parseInt(e.target.value) || 1)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Land Size *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.landSize || 0}
                        onChange={(e) => handleInputChange('landSize', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                        placeholder="e.g., 0.25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit *</label>
                      <select
                        value={formData.landUnit || ''}
                        onChange={(e) => handleInputChange('landUnit', e.target.value as 'Acres' | 'Hectares' | '')}
                        className={`w-full px-3 py-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white' 
                            : 'bg-white border-gray-200 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      >
                        <option value="">Select</option>
                        <option value="Acres">Acres</option>
                        <option value="Hectares">Hectares</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'bg:white/5 border-white/10 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      placeholder="e.g., $450,000"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      placeholder="e.g., Westlands, Nairobi"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                  placeholder="Describe your property in detail..."
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="text-xl font-bold mb-4">{isLand ? 'Land Details' : 'Property Details'}</h4>
              
              {!isLand && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bedrooms</label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bathrooms</label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Area (sq ft)</label>
                    <div className="relative">
                      <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        min="0"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {amenitiesOptions.map(amenity => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          if (formData.amenities.includes(amenity)) {
                            removeAmenity(amenity);
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              amenities: [...prev.amenities, amenity]
                            }));
                          }
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.amenities.includes(amenity)
                            ? 'bg-[#C7A667] text-black'
                            : isDarkMode
                              ? 'bg-white/10 text-white/70 hover:bg-white/20'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      placeholder="Add custom amenity..."
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-2">Features</label>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {featuresOptions.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => {
                          if (formData.features.includes(feature)) {
                            removeFeature(feature);
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, feature]
                            }));
                          }
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.features.includes(feature)
                            ? 'bg-[#C7A667] text-black'
                            : isDarkMode
                              ? 'bg-white/10 text-white/70 hover:bg-white/20'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                      placeholder="Add custom feature..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h4 className="text-xl font-bold mb-4">Property Images</h4>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
                <h5 className="text-lg font-medium mb-2">Upload Property Images</h5>
                <p className="text-gray-600 mb-4">Drag and drop images here, or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium cursor-pointer hover:bg-[#B8965A] transition-colors"
                >
                  <Upload size={20} />
                  Choose Images
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-white/10">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-white/20 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/30'
              }`}
              whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
            >
              Previous
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>

              {currentStep < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-[#C7A667] text-black hover:bg-[#B8965A]'
                  }`}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('PropertyUploadModal: Save button clicked, isSubmitting:', isSubmitting);
                    if (isSubmitting) {
                      console.log('PropertyUploadModal: Button clicked but already submitting, ignoring');
                      return;
                    }
                    // Manually trigger form submission
                    handleSubmit(e);
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating Property...
                    </>
                  ) : (
                    editingProperty ? 'Update Property' : 'Save Property'
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
