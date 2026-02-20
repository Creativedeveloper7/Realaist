import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Bed,
  User,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400';

interface HostsPageProps {
  isDarkMode: boolean;
}

interface HostProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface HostProperty {
  id: string;
  title: string;
  location: string;
  status: string;
  price: number;
  property_type: string;
  created_at: string;
  images: string[] | null;
}

interface GuestMessageRow {
  id: string;
  property_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  read: boolean;
  created_at: string;
  property?: { id: string; title: string; location?: string } | null;
}

interface HostWithProperties {
  profile: HostProfile;
  properties: HostProperty[];
}

export default function HostsPage({ isDarkMode }: HostsPageProps) {
  const [hosts, setHosts] = useState<HostWithProperties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<GuestMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, phone, address, created_at')
          .eq('user_type', 'host');

        if (profilesError) {
          setError(profilesError.message);
          setHosts([]);
          return;
        }

        const hostProfiles = (profilesData || []) as HostProfile[];
        if (hostProfiles.length === 0) {
          setHosts(hostProfiles.map(p => ({ profile: p, properties: [] })));
          setLoading(false);
          return;
        }

        const hostIds = hostProfiles.map(p => p.id);
        const { data: propsData, error: propsError } = await supabase
          .from('properties')
          .select('id, developer_id, title, location, status, price, property_type, created_at, images')
          .in('developer_id', hostIds);

        const props = (propsError ? [] : propsData || []) as (HostProperty & { developer_id: string })[];
        const shortStays = props.filter(p => (p.property_type || '').toLowerCase() === 'short stay');

        const byHost = new Map<string, HostProperty[]>();
        hostProfiles.forEach(p => byHost.set(p.id, []));
        shortStays.forEach(p => {
          const list = byHost.get(p.developer_id);
          if (list) list.push({ ...p, images: p.images || null });
        });

        setHosts(
          hostProfiles.map(profile => ({
            profile,
            properties: byHost.get(profile.id) || [],
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load hosts');
        setHosts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    const host = hosts.find(h => h.profile.id === selectedId);
    const propertyIds = host?.properties.map(p => p.id) ?? [];
    if (propertyIds.length === 0) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);
    supabase
      .from('guest_messages')
      .select(`
        id,
        property_id,
        sender_name,
        sender_email,
        message,
        read,
        created_at,
        property:properties(id, title, location)
      `)
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false })
      .then(({ data, error: msgError }) => {
        if (cancelled) return;
        setMessagesLoading(false);
        if (msgError) {
          setMessages([]);
          return;
        }
        setMessages(
          (data || []).map((row: any) => ({
            id: row.id,
            property_id: row.property_id,
            sender_name: row.sender_name,
            sender_email: row.sender_email,
            message: row.message,
            read: row.read ?? false,
            created_at: row.created_at,
            property: row.property ?? null,
          }))
        );
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, hosts]);

  const dark = isDarkMode;
  const cardBg = dark ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200';
  const heading = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-white/70' : 'text-gray-600';
  const muted = dark ? 'text-white/50' : 'text-gray-500';
  const selectedBg = dark ? 'bg-[#C7A667]/20 border-[#C7A667]/50' : 'bg-[#C7A667]/10 border-[#C7A667]/50';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

  const selected = hosts.find(h => h.profile.id === selectedId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[420px]">
      <div className="flex-shrink-0 mb-2">
        <h1 className={`text-xl font-bold ${heading}`}>Hosts</h1>
        <p className={`text-sm ${subtext}`}>
          Select a host to view their details, properties, and guest messages.
        </p>
      </div>

      {error && (
        <div className={`flex-shrink-0 p-4 rounded-xl ${cardBg} border text-red-500 text-sm`}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={`flex-1 rounded-xl ${cardBg} border flex items-center justify-center gap-3`}>
          <div className="w-6 h-6 border-2 border-[#C7A667] border-t-transparent rounded-full animate-spin" />
          <span className={subtext}>Loading hosts…</span>
        </div>
      ) : hosts.length === 0 ? (
        <div className={`flex-1 rounded-xl ${cardBg} border flex items-center justify-center`}>
          <div className="text-center">
            <Home className={`mx-auto mb-3 ${muted}`} size={40} />
            <p className={subtext}>No hosts registered yet.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0 rounded-xl overflow-hidden">
          {/* Left: host list */}
          <div
            className={`flex-shrink-0 w-72 md:w-80 flex flex-col rounded-xl border overflow-hidden ${cardBg}`}
          >
            <div className={`flex-shrink-0 px-3 py-2 border-b ${dark ? 'border-white/10' : 'border-gray-200'}`}>
              <p className={`text-xs uppercase tracking-wide ${muted}`}>
                {hosts.length} host{hosts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {hosts.map(({ profile, properties }) => {
                const isSelected = selectedId === profile.id;
                const name =
                  [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—';
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedId(profile.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b ${dark ? 'border-white/5' : 'border-gray-100'} last:border-0 transition-colors ${
                      isSelected ? selectedBg : dark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        dark ? 'bg-[#C7A667]/20' : 'bg-[#C7A667]/20'
                      }`}
                    >
                      <User className="text-[#C7A667]" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate text-sm ${heading}`}>{name}</p>
                      <p className={`text-xs truncate ${muted}`}>{profile.email}</p>
                      <p className={`text-xs mt-0.5 ${muted}`}>
                        {properties.length} short stay{properties.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight
                      className={`flex-shrink-0 ${isSelected ? 'text-[#C7A667]' : muted}`}
                      size={18}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: detail panel */}
          <div
            className={`flex-1 min-w-0 flex flex-col rounded-xl border overflow-hidden ${cardBg}`}
          >
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-center p-8"
                >
                  <div className="text-center">
                    <User className={`mx-auto mb-3 ${muted}`} size={48} />
                    <p className={`font-medium ${subtext}`}>Select a host</p>
                    <p className={`text-sm mt-1 ${muted}`}>
                      Choose a host from the list to view their details, properties, and messages.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selected.profile.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0 overflow-hidden"
                >
                  <div className={`flex-shrink-0 p-4 border-b ${dark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          dark ? 'bg-[#C7A667]/20' : 'bg-[#C7A667]/20'
                        }`}
                      >
                        <User className="text-[#C7A667]" size={24} />
                      </div>
                      <div>
                        <h2 className={`text-lg font-semibold ${heading}`}>
                          {[selected.profile.first_name, selected.profile.last_name]
                            .filter(Boolean)
                            .join(' ') || '—'}
                        </h2>
                        <p className={`text-sm ${muted}`}>
                          Joined {formatDate(selected.profile.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a
                        href={`mailto:${selected.profile.email}`}
                        className={`flex items-center gap-1.5 ${subtext} hover:text-[#C7A667]`}
                      >
                        <Mail size={14} />
                        {selected.profile.email}
                      </a>
                      {selected.profile.phone && (
                        <a
                          href={`tel:${selected.profile.phone}`}
                          className={`flex items-center gap-1.5 ${subtext} hover:text-[#C7A667]`}
                        >
                          <Phone size={14} />
                          {selected.profile.phone}
                        </a>
                      )}
                      {selected.profile.address && (
                        <span className={`flex items-center gap-1.5 ${subtext}`}>
                          <MapPin size={14} />
                          {selected.profile.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Properties with images */}
                    <section>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${heading}`}>
                        <Bed size={16} className="text-[#C7A667]" />
                        Short stay properties ({selected.properties.length})
                      </h3>
                      {selected.properties.length === 0 ? (
                        <p className={`text-sm ${muted}`}>No short stays listed yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selected.properties.map(prop => {
                            const img =
                              prop.images && prop.images.length > 0
                                ? prop.images[0]
                                : DEFAULT_IMAGE;
                            return (
                              <a
                                key={prop.id}
                                href={`/property/${prop.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block rounded-xl border overflow-hidden transition-opacity hover:opacity-90 ${cardBg}`}
                              >
                                <div className="aspect-[4/3] bg-white/5 relative">
                                  <img
                                    src={img}
                                    alt={prop.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <span
                                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs ${
                                      prop.status === 'active'
                                        ? dark
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : 'bg-emerald-100 text-emerald-700'
                                        : dark
                                          ? 'bg-white/10 text-white/70'
                                          : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {prop.status}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <p className={`font-medium truncate text-sm ${heading}`}>
                                    {prop.title}
                                  </p>
                                  <p className={`text-xs truncate ${muted}`}>{prop.location}</p>
                                  {prop.price != null && (
                                    <p className={`text-sm mt-1 ${subtext}`}>
                                      KSh {Number(prop.price).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    {/* Guest messages */}
                    <section>
                      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${heading}`}>
                        <MessageSquare size={16} className="text-[#C7A667]" />
                        Guest messages ({messages.length})
                      </h3>
                      {messagesLoading ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-[#C7A667] border-t-transparent rounded-full animate-spin" />
                          <span className={`text-sm ${muted}`}>Loading messages…</span>
                        </div>
                      ) : messages.length === 0 ? (
                        <p className={`text-sm ${muted}`}>
                          No messages from guests yet.
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {messages.map(msg => (
                            <li
                              key={msg.id}
                              className={`p-3 rounded-xl border text-sm ${cardBg}`}
                            >
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`font-medium ${heading}`}>{msg.sender_name}</span>
                                <a
                                  href={`mailto:${msg.sender_email}`}
                                  className="text-[#C7A667] hover:underline text-xs"
                                >
                                  {msg.sender_email}
                                </a>
                                {msg.property?.title && (
                                  <span className={`text-xs ${muted}`}>
                                    re: {msg.property.title}
                                  </span>
                                )}
                                <span className={`text-xs ${muted} ml-auto`}>
                                  {formatDateTime(msg.created_at)}
                                </span>
                              </div>
                              <p className={`${subtext} whitespace-pre-wrap break-words`}>
                                {msg.message}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
