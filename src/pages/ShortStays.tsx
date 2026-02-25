import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PanelsTopLeft,
  Pencil,
  Trash2,
  MapPin,
  ExternalLink,
  Plus,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { propertiesService, CreatePropertyData, Property } from '../services/propertiesService';
import { storageService } from '../services/storageService';
import { reverseGeocode } from '../utils/geocode';

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
  locationLatitude: string;
  locationLongitude: string;
  title: string;
  description: string;
  features: string[];
  amenities: string[];
  weekdayBasePrice: string;
  weekendBasePrice: string;
  registerForAds: boolean;
  images: File[];
  videoLink: string;
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

const defaultForm: ShortStayForm = {
  placeType: 'entire_place',
  category: 'Apartment',
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  location: '',
  locationLatitude: '',
  locationLongitude: '',
  title: '',
  description: '',
  features: [],
  amenities: [],
  weekdayBasePrice: '',
  weekendBasePrice: '',
  registerForAds: false,
  images: [],
  videoLink: '',
};

function parseDescriptionForEdit(description: string): { mainDescription: string; placeType: ShortStayForm['placeType']; category: ShortStayForm['category']; guests: number; bedrooms: number; beds: number; bathrooms: number } {
  const detailsMatch = description.match(/\n\nProperty Details:\n([\s\S]*)/);
  const mainDescription = detailsMatch ? description.slice(0, description.indexOf('\n\nProperty Details:')).trim() : description;
  const detailsBlock = detailsMatch ? detailsMatch[1] : '';
  let placeType: ShortStayForm['placeType'] = 'entire_place';
  let category: ShortStayForm['category'] = 'Apartment';
  let guests = 2, bedrooms = 1, beds = 1, bathrooms = 1;
  detailsBlock.split('\n').forEach(line => {
    const m = line.replace(/^•\s*/, '').trim();
    if (m.startsWith('Place type:')) {
      const v = m.replace('Place type:', '').trim().replace(/\s+/g, '_');
      if (v === 'entire_place' || v === 'private_room' || v === 'shared_room') placeType = v;
    } else if (m.startsWith('Category:')) {
      const v = m.replace('Category:', '').trim() as ShortStayForm['category'];
      if (['Apartment', 'House', 'Townhouse', 'Villa', 'Studio'].includes(v)) category = v;
    } else if (m.startsWith('Accommodates:')) {
      const n = parseInt(m.replace(/\D/g, ''), 10);
      if (!isNaN(n)) guests = n;
    } else if (m.startsWith('Bedrooms:')) {
      const n = parseInt(m.replace(/\D/g, ''), 10);
      if (!isNaN(n)) bedrooms = n;
    } else if (m.startsWith('Beds:')) {
      const n = parseInt(m.replace(/\D/g, ''), 10);
      if (!isNaN(n)) beds = n;
    } else if (m.startsWith('Bathrooms:')) {
      const n = parseInt(m.replace(/\D/g, ''), 10);
      if (!isNaN(n)) bathrooms = n;
    }
  });
  return { mainDescription, placeType, category, guests, bedrooms, beds, bathrooms };
}

type ViewMode = 'list' | 'create' | 'edit';

export const ShortStays: React.FC<ShortStaysProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [myShortStays, setMyShortStays] = useState<Property[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resolvedLocationNames, setResolvedLocationNames] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ShortStayForm>({ ...defaultForm });

  const weekdayBaseNumber = parseFloat(form.weekdayBasePrice.replace(/[,]/g, '')) || 0;
  const weekendBaseNumberRaw = parseFloat(form.weekendBasePrice.replace(/[,]/g, ''));
  const weekendBaseNumber = !isNaN(weekendBaseNumberRaw) && weekendBaseNumberRaw > 0 ? weekendBaseNumberRaw : weekdayBaseNumber;
  const guestVisibleWeekdayPrice = weekdayBaseNumber > 0 ? Math.round(weekdayBaseNumber * 1.07) : 0;
  const guestVisibleWeekendPrice = weekendBaseNumber > 0 ? Math.round(weekendBaseNumber * 1.07) : 0;

  // Load host's short stays for list view
  useEffect(() => {
    if (!user?.id || viewMode !== 'list') return;
    const load = async () => {
      setLoadingList(true);
      try {
        const { properties, error: err } = await propertiesService.getDeveloperProperties(user.id);
        if (!err) {
          const short = (properties || []).filter((p) => p.propertyType === 'Short Stay');
          setMyShortStays(short);
        }
      } catch (e) {
        console.error('Error loading short stays:', e);
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [user?.id, viewMode]);

  // Resolve "Current location" to place name for list cards when we have lat/lng
  useEffect(() => {
    const needResolve = myShortStays.filter(
      (p) => p.location?.trim() === 'Current location' && p.latitude != null && p.longitude != null
    );
    if (needResolve.length === 0) return;
    const keysToFetch = [...new Set(needResolve.map((p) => `${Number(p.latitude).toFixed(4)},${Number(p.longitude).toFixed(4)}`))];
    keysToFetch.forEach((key) => {
      if (resolvedLocationNames[key]) return;
      const [latStr, lngStr] = key.split(',');
      reverseGeocode(Number(latStr), Number(lngStr)).then((name) => {
        if (name) setResolvedLocationNames((cur) => (cur[key] ? cur : { ...cur, [key]: name }));
      });
    });
  }, [myShortStays, resolvedLocationNames]);

  useEffect(() => {
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { property?: Property };
      if (detail?.property && user?.id && detail.property.developerId === user.id) {
        setMyShortStays((prev) => {
          if (prev.some((p) => p.id === detail.property!.id)) return prev;
          return [{ ...detail.property!, propertyType: 'Short Stay' }, ...prev];
        });
      }
    };
    const onDeleted = (e: Event) => {
      const id = (e as CustomEvent).detail?.id;
      if (id) setMyShortStays((prev) => prev.filter((p) => p.id !== id));
    };
    window.addEventListener('realaist:property-created', onCreated as EventListener);
    window.addEventListener('realaist:property-deleted', onDeleted as EventListener);
    return () => {
      window.removeEventListener('realaist:property-created', onCreated as EventListener);
      window.removeEventListener('realaist:property-deleted', onDeleted as EventListener);
    };
  }, [user?.id]);

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

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveExistingImage = (index: number, direction: 'up' | 'down') => {
    setExistingImageUrls((prev) => {
      const next = [...prev];
      const j = direction === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const moveNewImage = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const next = [...prev.images];
      const j = direction === 'up' ? index - 1 : index + 1;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return { ...prev, images: next };
    });
  };

  const loadPropertyIntoForm = (property: Property) => {
    const parsed = parseDescriptionForEdit(property.description || '');
    const weekday = property.weekdayPrice ?? property.price;
    const weekend = property.weekendPrice ?? property.weekdayPrice ?? property.price;
    setForm({
      placeType: parsed.placeType,
      category: parsed.category,
      guests: parsed.guests,
      bedrooms: property.bedrooms ?? parsed.bedrooms,
      beds: parsed.beds,
      bathrooms: property.bathrooms ?? parsed.bathrooms,
      location: property.location || '',
      locationLatitude: property.latitude != null ? String(property.latitude) : '',
      locationLongitude: property.longitude != null ? String(property.longitude) : '',
      title: property.title || '',
      description: parsed.mainDescription,
      features: Array.isArray(property.features) ? property.features : [],
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      weekdayBasePrice: weekday ? String(Math.round(weekday / 1.07)) : '',
      weekendBasePrice: weekend ? String(Math.round(weekend / 1.07)) : '',
      registerForAds: false,
      images: [],
      videoLink: property.videoUrl || '',
    });
    setExistingImageUrls(property.images || []);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const { error: err } = await propertiesService.deleteProperty(id);
      if (err) setError(err);
      else setDeleteConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const startCreate = () => {
    setViewMode('create');
    setForm({ ...defaultForm });
    setStep(1);
    setEditingId(null);
    setExistingImageUrls([]);
    setError(null);
    setSuccessMessage(null);
  };

  const startEdit = (property: Property) => {
    setEditingId(property.id);
    loadPropertyIntoForm(property);
    setViewMode('edit');
    setStep(1);
    setError(null);
    setSuccessMessage(null);
  };

  const canGoNext = () => {
    if (step === 1) {
      return form.location.trim().length > 0;
    }
    if (step === 4) {
      return editingId ? (existingImageUrls.length + form.images.length) > 0 : form.images.length > 0;
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
      setError('You must be logged in as a developer or host to create a short stay.');
      return;
    }

    if (!weekdayBaseNumber || weekdayBaseNumber <= 0) {
      setError('Please enter a valid weekday base price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const nightlyWeekdayWithTax = guestVisibleWeekdayPrice || Math.round(weekdayBaseNumber * 1.07);
    const nightlyWeekendWithTax = guestVisibleWeekendPrice || Math.round(weekendBaseNumber * 1.07);
    const descriptionText = `${form.description}\n\nProperty Details:\n• Place type: ${form.placeType.replace('_', ' ')}\n• Category: ${form.category}\n• Accommodates: ${form.guests} guest${form.guests !== 1 ? 's' : ''}\n• Bedrooms: ${form.bedrooms}\n• Beds: ${form.beds}\n• Bathrooms: ${form.bathrooms}`;

    const parsedLat = form.locationLatitude.trim() ? parseFloat(form.locationLatitude) : undefined;
    const parsedLng = form.locationLongitude.trim() ? parseFloat(form.locationLongitude) : undefined;
    const hasValidCoords = parsedLat !== undefined && parsedLng !== undefined && !isNaN(parsedLat) && !isNaN(parsedLng)
      && Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180;
    const latitude = hasValidCoords ? parsedLat! : undefined;
    const longitude = hasValidCoords ? parsedLng! : undefined;

    try {
      if (editingId) {
        // Update existing property
        const newImageUrls: string[] = [];
        for (const imageFile of form.images) {
          try {
            const compressedImage = await storageService.compressImage(imageFile, 1920, 0.8);
            const { url, error: uploadError } = await storageService.uploadPropertyImage(compressedImage, editingId);
            if (!uploadError && url) newImageUrls.push(url);
          } catch (err) {
            console.warn('Error uploading image:', err);
          }
        }
        const allImages = [...existingImageUrls, ...newImageUrls];

        const { property: updated, error: updateErr } = await propertiesService.updateProperty({
          id: editingId,
          title: form.title,
          description: descriptionText,
          price: nightlyWeekdayWithTax,
          weekdayPrice: nightlyWeekdayWithTax,
          weekendPrice: nightlyWeekendWithTax,
          location: form.location,
          propertyType: 'Short Stay',
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          images: allImages,
          amenities: form.amenities,
          features: form.features,
          videoUrl: form.videoLink.trim() || undefined,
          latitude,
          longitude,
        });

        if (updateErr || !updated) {
          throw new Error(updateErr || 'Failed to update short stay');
        }
        setSuccessMessage('Short stay updated successfully.');
        setViewMode('list');
        setEditingId(null);
        setMyShortStays((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      } else {
        // Create new property
        const propertyData: CreatePropertyData = {
          title: form.title,
          description: descriptionText,
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
          videoUrl: form.videoLink.trim() || undefined,
          latitude,
          longitude,
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
              if (!uploadError && url) imageUrls.push(url);
            } catch (err) {
              console.warn('Error uploading short stay image:', err);
            }
          }
          if (imageUrls.length > 0 || form.videoLink.trim()) {
            await propertiesService.updateProperty({
              id: property.id,
              ...(imageUrls.length > 0 && { images: imageUrls }),
              ...(form.videoLink.trim() && { videoUrl: form.videoLink.trim() }),
            });
          }
        }

        try {
          window.dispatchEvent(new CustomEvent('realaist:property-created', { detail: { property: { ...property, images: imageUrls.length ? imageUrls : property.images } } }));
        } catch {}

        setSuccessMessage('Short stay created successfully!');
        if (form.registerForAds) {
          window.location.href = `/dashboard/campaign-ads?propertyId=${property.id}`;
        } else {
          setStep(totalSteps);
        }
      }
    } catch (err: any) {
      console.error('Error saving short stay:', err);
      setError(err?.message || (editingId ? 'An unexpected error occurred while updating.' : 'An unexpected error occurred while creating the short stay.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.userType === 'buyer') {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Short Stays</h1>
        <p className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>
          Short stay listings can only be created by developers or hosts. Sign up as a developer or host to list your properties.
        </p>
      </div>
    );
  }

  // List view for host / developer
  if (viewMode === 'list' && (user?.userType === 'host' || user?.userType === 'developer')) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Short Stays</h1>
            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
              Manage your short stay listings. Edit or delete any listing below.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={startCreate}
            className="px-5 py-2.5 rounded-lg bg-[#C7A667] text-black font-medium flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            Add Short Stay
          </motion.button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingList ? (
          <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'} p-12 text-center`}>
            <Loader2 className={`animate-spin mx-auto mb-3 ${isDarkMode ? 'text-[#C7A667]' : 'text-[#C7A667]'}`} size={40} />
            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Loading your short stays...</p>
          </div>
        ) : myShortStays.length === 0 ? (
          <motion.div
            className={`rounded-2xl border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'} p-12 text-center`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Building2 className={`mx-auto mb-4 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`} size={48} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No short stays yet</h3>
            <p className={isDarkMode ? 'text-white/70 mb-6' : 'text-gray-600 mb-6'}>
              Create your first short stay listing to start receiving bookings.
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="px-5 py-2.5 rounded-lg bg-[#C7A667] text-black font-medium inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add your first short stay
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {myShortStays.map((property) => (
              <motion.div
                key={property.id}
                className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-40 sm:h-auto shrink-0 bg-gray-200">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bed className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-lg truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{property.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">
                          {property.location?.trim() === 'Current location' && property.latitude != null && property.longitude != null
                            ? (resolvedLocationNames[`${Number(property.latitude).toFixed(4)},${Number(property.longitude).toFixed(4)}`] ?? property.location)
                            : property.location}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        KSh {(property.price ?? 0).toLocaleString()} / night
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${property.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'}`}>
                          {property.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/property/${property.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 text-sm font-medium ${isDarkMode ? 'text-[#C7A667] hover:text-[#B89657]' : 'text-[#C7A667] hover:text-[#B89657]'}`}
                      >
                        View
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => startEdit(property)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(property.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingId && setDeleteConfirmId(null)}
            >
              <motion.div
                className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Delete short stay?</h3>
                <p className={isDarkMode ? 'text-white/70 mb-6' : 'text-gray-600 mb-6'}>
                  This listing will be removed permanently. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={!!deletingId}
                    className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(deleteConfirmId)}
                    disabled={!!deletingId}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-70 flex items-center gap-2"
                  >
                    {deletingId === deleteConfirmId ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {(viewMode === 'create' || viewMode === 'edit') && (
              <button
                type="button"
                onClick={() => { setViewMode('list'); setEditingId(null); setError(null); setSuccessMessage(null); }}
                className={`text-sm font-medium ${isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                ← Back to list
              </button>
            )}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? 'Edit short stay' : 'Short Stays'}
          </h1>
          <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
            {editingId ? 'Update your listing details below.' : 'Create Airbnb-style short stay listings with beautiful, guided steps.'}
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
                  onChange={e => { setForm(prev => ({ ...prev, location: e.target.value })); setLocationError(null); }}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. Westlands, Nairobi"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Latitude (optional, for accurate map pin)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.locationLatitude}
                  onChange={e => setForm(prev => ({ ...prev, locationLatitude: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. -1.2921"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  Longitude (optional, for accurate map pin)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.locationLongitude}
                  onChange={e => setForm(prev => ({ ...prev, locationLongitude: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g. 36.8219"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) {
                    setLocationError('Geolocation is not supported by your browser.');
                    return;
                  }
                  setGettingLocation(true);
                  setLocationError(null);
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const lat = pos.coords.latitude;
                      const lng = pos.coords.longitude;
                      setForm(prev => ({
                        ...prev,
                        locationLatitude: String(lat),
                        locationLongitude: String(lng),
                      }));
                      // Resolve place name so cards/details show e.g. "Kikuyu" instead of "Current location"
                      const placeName = await reverseGeocode(lat, lng);
                      setForm(prev => ({
                        ...prev,
                        location: (prev.location.trim() === '' || prev.location === 'Current location')
                          ? (placeName || 'Current location')
                          : prev.location,
                      }));
                      setGettingLocation(false);
                    },
                    (err) => {
                      setGettingLocation(false);
                      if (err.code === err.PERMISSION_DENIED) {
                        setLocationError('Location access was denied. You can enter latitude and longitude manually.');
                      } else {
                        setLocationError(err.message || 'Could not get your location. Try entering coordinates manually.');
                      }
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
                  );
                }}
                disabled={gettingLocation}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                  isDarkMode
                    ? 'border-white/20 text-white hover:bg-white/10'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting location…
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    Use my current location
                  </>
                )}
              </button>
              {locationError && (
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{locationError}</p>
              )}
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
                {editingId ? 'Keep or add photos. At least one photo is required.' : 'Add at least one photo. Great photos help guests picture themselves staying there.'}
              </p>
            </div>

            {editingId && existingImageUrls.length > 0 && (
              <div>
                <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>Current photos — use arrows to reorder (first = cover)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                        <img src={url} alt={`Current ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      {index === 0 && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-amber-500/90 text-black' : 'bg-amber-400 text-black'}`}>Cover</span>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveExistingImage(index, 'up')}
                          disabled={index === 0}
                          className={`p-1.5 rounded-full text-xs ${index === 0 ? 'bg-black/30 text-white/50 cursor-not-allowed' : 'bg-black/70 text-white hover:bg-black/90'}`}
                          title="Move earlier"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExistingImage(index, 'down')}
                          disabled={index === existingImageUrls.length - 1}
                          className={`p-1.5 rounded-full text-xs ${index === existingImageUrls.length - 1 ? 'bg-black/30 text-white/50 cursor-not-allowed' : 'bg-black/70 text-white hover:bg-black/90'}`}
                          title="Move later"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <div>
                <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>New uploads — use arrows to set order (first = cover)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                        <img src={URL.createObjectURL(image)} alt={`Short stay ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      {index === 0 && !editingId && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-amber-500/90 text-black' : 'bg-amber-400 text-black'}`}>Cover</span>
                      )}
                      {editingId && existingImageUrls.length === 0 && index === 0 && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-amber-500/90 text-black' : 'bg-amber-400 text-black'}`}>Cover</span>
                      )}
                      {editingId && existingImageUrls.length > 0 && index === 0 && (
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-700/80 text-white'}`}>First of new</span>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveNewImage(index, 'up')}
                          disabled={index === 0}
                          className={`p-1.5 rounded-full text-xs ${index === 0 ? 'bg-black/30 text-white/50 cursor-not-allowed' : 'bg-black/70 text-white hover:bg-black/90'}`}
                          title="Move earlier"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveNewImage(index, 'down')}
                          disabled={index === form.images.length - 1}
                          className={`p-1.5 rounded-full text-xs ${index === form.images.length - 1 ? 'bg-black/30 text-white/50 cursor-not-allowed' : 'bg-black/70 text-white hover:bg-black/90'}`}
                          title="Move later"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="short-stay-video-link" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                Video link (optional)
              </label>
              <input
                id="short-stay-video-link"
                type="url"
                value={form.videoLink}
                onChange={e => setForm(prev => ({ ...prev, videoLink: e.target.value }))}
                placeholder="https://..."
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode ? 'bg-black/40 border-white/20 text-white placeholder:text-white/50' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                }`}
              />
              <p className={`mt-1 text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                This link is shown as &quot;Watch Video&quot; on the property details page.
              </p>
            </div>
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
              <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingId ? 'Save changes' : 'Finish up and publish'}
              </h2>
              <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                {editingId ? 'Review and save your updates.' : 'Choose whether you want to promote this short stay with campaign ads before publishing.'}
              </p>
            </div>

            {!editingId && (
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
            )}

            <p className={isDarkMode ? 'text-white/60 text-sm' : 'text-gray-500 text-sm'}>
              {editingId ? 'By saving, you confirm that the information is accurate.' : 'By publishing, you confirm that the information about this short stay is accurate and that you have the right to host guests at this property.'}
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
              {editingId ? 'Saving...' : 'Publishing...'}
            </>
          ) : step < totalSteps ? (
            'Next'
          ) : editingId ? (
            'Save changes'
          ) : (
            'Finish & Publish'
          )}
        </button>
      </div>
    </div>
  );
};

export default ShortStays;

