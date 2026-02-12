import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bed,
  Home,
  Building2,
  Users,
  Image as ImageIcon,
  Upload,
  Loader2,
  Wifi,
  CarFront,
  Monitor,
  Utensils,
  Briefcase,
  Refrigerator,
  WashingMachine,
  Microwave,
  Waves,
  Snowflake,
  Flame,
  Dumbbell,
  Wind,
  Shield,
  PanelsTopLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { propertiesService, CreatePropertyData } from '../services/propertiesService';
import { storageService } from '../services/storageService';

interface ShortStaysProps {
  isDarkMode: boolean;
}

interface ShortStayForm {
  placeType: 'entire_place' | 'private_room' | 'shared_room';
  category: 'Apartment' | 'House' | 'Townhouse' | 'Villa' | 'Studio';
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  location: string;
  title: string;
  description: string;
  features: string[];
  amenities: string[];
  weekdayBasePrice: string;
  weekendBasePrice: string;
  registerForAds: boolean;
  images: File[];
}

const featureOptions = ['Peaceful', 'Central', 'Spacious', 'Family-friendly', 'Stylish', 'Unique'];

const amenityOptions = [
  { id: 'kitchen', label: 'Kitchen', Icon: Utensils },
  { id: 'workspace', label: 'Dedicated workspace', Icon: Briefcase },
  { id: 'tv', label: 'TV', Icon: Monitor },
  { id: 'refrigerator', label: 'Refrigerator', Icon: Refrigerator },
  { id: 'wifi', label: 'Wifi', Icon: Wifi },
  { id: 'parking', label: 'Free parking on premises', Icon: CarFront },
  { id: 'washer', label: 'Washer', Icon: WashingMachine },
  { id: 'microwave', label: 'Microwave', Icon: Microwave },
  { id: 'pool', label: 'Pool', Icon: Waves },
  { id: 'ac', label: 'Air conditioning', Icon: Snowflake },
  { id: 'heating', label: 'Heating', Icon: Flame },
  { id: 'gym', label: 'Gym', Icon: Dumbbell },
  { id: 'dryer', label: 'Dryer', Icon: Wind },
  { id: 'balcony', label: 'Balcony', Icon: PanelsTopLeft },
  { id: 'security', label: 'Security', Icon: Shield },
];

export const ShortStays: React.FC<ShortStaysProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<ShortStayForm>({
    placeType: 'entire_place',
    category: 'Apartment',
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    location: '',
    title: '',
    description: '',
    features: [],
    amenities: [],
    weekdayBasePrice: '',
    weekendBasePrice: '',
    registerForAds: false,
    images: [],
  });

  const weekdayBaseNumber = parseFloat(form.weekdayBasePrice.replace(/[,]/g, '')) || 0;
  const weekendBaseNumberRaw = parseFloat(form.weekendBasePrice.replace(/[,]/g, ''));
  const weekendBaseNumber = !isNaN(weekendBaseNumberRaw) && weekendBaseNumberRaw > 0 ? weekendBaseNumberRaw : weekdayBaseNumber;
  const guestVisibleWeekdayPrice = weekdayBaseNumber > 0 ? Math.round(weekdayBaseNumber * 1.07) : 0;
  const guestVisibleWeekendPrice = weekendBaseNumber > 0 ? Math.round(weekendBaseNumber * 1.07) : 0;

  const toggleFeature = (f: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(x => x !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = storageService.validateImageFile(file, 10);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const canGoNext = () => {
    if (step === 1) {
      return form.location.trim().length > 0;
    }
    if (step === 4) {
      return form.images.length > 0;
    }
    if (step === 5) {
      return form.title.trim().length > 0 && form.description.trim().length > 0;
    }
    if (step === 6) {
      return weekdayBaseNumber > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('You must be logged in as a developer to create a short stay.');
      return;
    }

    if (!weekdayBaseNumber || weekdayBaseNumber <= 0) {
      setError('Please enter a valid weekday base price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const nightlyWeekdayWithTax = guestVisibleWeekdayPrice || Math.round(weekdayBaseNumber * 1.07);
      const nightlyWeekendWithTax = guestVisibleWeekendPrice || Math.round(weekendBaseNumber * 1.07);

      const propertyData: CreatePropertyData = {
        title: form.title,
        description: `${form.description}\n\nProperty Details:\n• Place type: ${form.placeType.replace('_', ' ')}\n• Category: ${form.category}\n• Accommodates: ${form.guests} guest${form.guests !== 1 ? 's' : ''}\n• Bedrooms: ${form.bedrooms}\n• Beds: ${form.beds}\n• Bathrooms: ${form.bathrooms}`,
        price: nightlyWeekdayWithTax,
        weekdayPrice: nightlyWeekdayWithTax,
        weekendPrice: nightlyWeekendWithTax,
        location: form.location,
        propertyType: 'Short Stay',
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        squareFeet: undefined,
        status: 'active',
        images: [],
        amenities: form.amenities,
        features: form.features,
      };

      const result = await propertiesService.createProperty(propertyData);
      const property = result.property;

      if (!property || result.error) {
        throw new Error(result.error || 'Failed to create short stay property');
      }

      const imageUrls: string[] = [];
      if (form.images.length > 0) {
        for (const imageFile of form.images) {
          try {
            const compressedImage = await storageService.compressImage(imageFile, 1920, 0.8);
            const { url, error: uploadError } = await storageService.uploadPropertyImage(compressedImage, property.id);
            if (!uploadError && url) {
              imageUrls.push(url);
            }
          } catch (err) {
            console.warn('Error uploading short stay image:', err);
          }
        }
        if (imageUrls.length > 0) {
          await propertiesService.updateProperty({
            id: property.id,
            images: imageUrls,
          });
        }
      }

      try {
        window.dispatchEvent(new CustomEvent('realaist:property-created', { detail: { property: { ...property, images: imageUrls.length ? imageUrls : property.images } } }));
      } catch {}

      setSuccessMessage('Short stay created successfully!');

      if (form.registerForAds) {
        window.location.href = `/dashboard/campaign-ads?propertyId=${property.id}`;
      }

      setStep(totalSteps);
    } catch (err: any) {
      console.error('Error creating short stay:', err);
      setError(err?.message || 'An unexpected error occurred while creating the short stay.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.userType === 'buyer') {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Short Stays</h1>
        <p className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>
          Short stay listings can only be created by developers. Please switch to a developer account to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Short Stays</h1>
          <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
            Create Airbnb-style short stay listings with beautiful, guided steps.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? 'bg-[#C7A667] text-black' : isDarkMode ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < totalSteps && (
                <div
                  className={`w-10 h-1 mx-2 rounded-full ${
                    s < step ? 'bg-[#C7A667]' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className={`rounded-2xl border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'} p-6 md:p-8`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={step}
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tell us about your place</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                What type of short stay are you offering, and where is it located?
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: 'entire_place', label: 'An entire place', description: 'Guests have the whole place to themselves.', icon: Home },
                { id: 'private_room', label: 'A room', description: 'Guests have their own room in a home.', icon: Bed },
                { id: 'shared_room', label: 'A shared room', description: 'Guests sleep in a shared space.', icon: Users },
              ].map(option => {
                const Icon = option.icon;
                const isActive = form.placeType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, placeType: option.id as ShortStayForm['placeType'] }))}
                    className={`text-left p-4 rounded-2xl border transition-colors ${
                      isActive
                        ? 'border-[#C7A667] bg-[#C7A667]/10'
                        : isDarkMode
                          ? 'border-white/10 hover:border-white/30'
                          : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className={isDarkMode ? 'text-white' : 'text-gray-800'} size={20} />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{option.label}</span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{option.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Property type
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value as ShortStayForm['category'] }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Villa">Villa</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Location (city / area)
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. Westlands, Nairobi"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { id: 'guests', label: 'Guests', value: form.guests },
                { id: 'bedrooms', label: 'Bedrooms', value: form.bedrooms },
                { id: 'beds', label: 'Beds', value: form.beds },
                { id: 'bathrooms', label: 'Bathrooms', value: form.bathrooms },
              ].map(field => (
                <div key={field.id}>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                        isDarkMode ? 'border-white/20 text-white' : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          [field.id]: Math.max(1, (prev as any)[field.id] - 1),
                        }))
                      }
                    >
                      -
                    </button>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{field.value}</span>
                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                        isDarkMode ? 'border-white/20 text-white' : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          [field.id]: (prev as any)[field.id] + 1,
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tell guests what your place has to offer</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                Choose a few features that describe your short stay. You can add more later.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {featureOptions.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    form.features.includes(f)
                      ? 'bg-[#C7A667] text-black border-[#C7A667]'
                      : isDarkMode
                        ? 'border-white/20 text-white/80 hover:bg-white/10'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What amenities does your place offer?</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                Select all amenities available at your short stay property.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenityOptions.map(amenity => {
                const isSelected = form.amenities.includes(amenity.id);
                const Icon = amenity.Icon;
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'border-[#C7A667] bg-[#C7A667]/10'
                        : isDarkMode
                          ? 'border-white/20 hover:border-white/30'
                          : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={
                        isSelected
                          ? 'text-[#C7A667]'
                          : isDarkMode
                            ? 'text-white/80'
                            : 'text-gray-700'
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-[#C7A667]'
                          : isDarkMode
                            ? 'text-white/80'
                            : 'text-gray-700'
                      }`}
                    >
                      {amenity.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Make your place stand out</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                Add at least one photo. Great photos help guests picture themselves staying there.
              </p>
            </div>

            <div className="border-2 border-dashed rounded-xl p-8 text-center border-gray-300 dark:border-white/20">
              <ImageIcon className="mx-auto mb-4 text-gray-400" size={40} />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload photos</h3>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Drag and drop or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="short-stay-image-upload"
              />
              <label
                htmlFor="short-stay-image-upload"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-lg bg-[#C7A667] text-black font-medium cursor-pointer hover:bg-[#B89657]"
              >
                <Upload size={18} />
                Choose images
              </label>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                      <img src={URL.createObjectURL(image)} alt={`Short stay ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Give your short stay a title</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                Short, catchy titles work best. You can always change this later.
              </p>
            </div>

            <div>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border text-lg ${
                  isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g. Winchester Gardens Apartment"
              />
            </div>

            <div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create your description</h3>
              <textarea
                rows={5}
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Share what makes your place special..."
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Set your weekday base price</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                This is the price you set as a developer. Guests will see prices including taxes.
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>KSh</span>
              <input
                type="number"
                min={0}
                value={form.weekdayBasePrice}
                onChange={e => setForm(prev => ({ ...prev, weekdayBasePrice: e.target.value }))}
                className={`text-4xl font-semibold border-b focus:outline-none bg-transparent flex-1 ${
                  isDarkMode ? 'border-white/30 text-white' : 'border-gray-400 text-gray-900'
                }`}
                placeholder="0"
              />
            </div>

            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
              Weekday: guests will see approximately{' '}
              <span className="font-semibold">
                {guestVisibleWeekdayPrice ? `KSh ${guestVisibleWeekdayPrice.toLocaleString()}` : 'KSh 0'}
              </span>{' '}
              per night (prices including taxes).
            </p>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                Weekend price (optional)
              </label>
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>KSh</span>
                <input
                  type="number"
                  min={0}
                  value={form.weekendBasePrice}
                  onChange={e => setForm(prev => ({ ...prev, weekendBasePrice: e.target.value }))}
                  className={`text-2xl font-semibold border-b focus:outline-none bg-transparent flex-1 ${
                    isDarkMode ? 'border-white/30 text-white' : 'border-gray-400 text-gray-900'
                  }`}
                  placeholder="Leave empty to use weekday price"
                />
              </div>
              <p className={isDarkMode ? 'text-white/70 mt-2' : 'text-gray-600 mt-2'}>
                Weekend: guests will see approximately{' '}
                <span className="font-semibold">
                  {guestVisibleWeekendPrice ? `KSh ${guestVisibleWeekendPrice.toLocaleString()}` : guestVisibleWeekdayPrice ? `KSh ${guestVisibleWeekdayPrice.toLocaleString()}` : 'KSh 0'}
                </span>{' '}
                per night (prices including taxes).
              </p>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Finish up and publish</h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                Choose whether you want to promote this short stay with campaign ads before publishing.
              </p>
            </div>

            <div className="border rounded-xl p-4 flex items-start gap-3">
              <div className="mt-1">
                <input
                  id="register-ads"
                  type="checkbox"
                  checked={form.registerForAds}
                  onChange={e => setForm(prev => ({ ...prev, registerForAds: e.target.checked }))}
                  className="w-4 h-4 accent-[#C7A667]"
                />
              </div>
              <div>
                <label
                  htmlFor="register-ads"
                  className={`block font-medium mb-1 cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Register this property for Campaign Ads
                </label>
                <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                  We’ll take you to the Campaign Ads setup after publishing so you can run targeted ads for this short stay.
                </p>
              </div>
            </div>

            <p className={isDarkMode ? 'text-white/60 text-sm' : 'text-gray-500 text-sm'}>
              By publishing, you confirm that the information about this short stay is accurate and that you have the
              right to host guests at this property.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-lg border border-green-300 bg-green-50 text-sm text-green-700">
            {successMessage}
          </div>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          disabled={step === 1 || isSubmitting}
          className={`px-5 py-2 rounded-lg border text-sm font-medium ${
            step === 1 || isSubmitting
              ? 'opacity-60 cursor-not-allowed border-gray-300 text-gray-400'
              : isDarkMode
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => {
            if (step < totalSteps) {
              if (!canGoNext()) return;
              setStep(prev => prev + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={isSubmitting || (step < totalSteps && !canGoNext())}
          className={`px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
            isSubmitting || (step < totalSteps && !canGoNext())
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-[#C7A667] text-black hover:bg-[#B89657]'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Publishing...
            </>
          ) : step < totalSteps ? (
            'Next'
          ) : (
            'Finish & Publish'
          )}
        </button>
      </div>
    </div>
  );
};

export default ShortStays;

