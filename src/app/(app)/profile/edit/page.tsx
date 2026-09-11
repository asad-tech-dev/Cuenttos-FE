"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Check,
  ChevronDown,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BackIcon } from "@/app/components/icons";
import {
  fetchUserProfile,
  updateUserProfile,
  UserProfile,
  formatUsername,
} from "@/lib/api/profile";
import { getCurrentUserId } from "@/lib/api/auth";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  Country,
  parsePhoneNumber,
} from "@/lib/constants/countries";
import checkAuth from "@/HOC/checkAuth";

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

function EditProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-[840px] mx-auto min-w-0 px-3.5 sm:px-6 py-4 sm:py-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-light-gray/60 w-full">
        <div className="w-20 h-6 bg-light-gray/60 rounded-md" />
        <div className="w-32 h-6 bg-light-gray/80 rounded-md" />
        <div className="w-8 h-6" />
      </div>

      {/* Identity Card Skeleton */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-light-gray/60 bg-white p-5 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-[100px] h-[100px] rounded-full bg-light-gray/70 shrink-0" />
        <div className="flex flex-col gap-2.5 flex-1 w-full pt-1">
          <div className="w-40 h-6 bg-light-gray/80 rounded-md" />
          <div className="w-24 h-4 bg-light-gray/60 rounded-md" />
          <div className="w-28 h-8 bg-light-gray/60 rounded-full mt-2" />
        </div>
      </div>

      {/* Bio Card Skeleton */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-light-gray/60 bg-white p-5 sm:p-7 flex flex-col gap-3">
        <div className="w-24 h-5 bg-light-gray/80 rounded-md" />
        <div className="w-full h-24 bg-light-gray/40 rounded-xl" />
      </div>

      {/* Personal Settings Card Skeleton */}
      <div className="rounded-[20px] sm:rounded-[24px] border border-light-gray/60 bg-white p-5 sm:p-7 flex flex-col gap-5">
        <div className="w-36 h-5 bg-light-gray/80 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-20 h-4 bg-light-gray/60 rounded-md" />
              <div className="w-full h-11 bg-light-gray/40 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-end gap-3 pt-2">
        <div className="w-24 h-11 bg-light-gray/50 rounded-full" />
        <div className="w-44 h-11 bg-light-gray/70 rounded-full" />
      </div>
    </div>
  );
}

function EditProfilePage() {
  const router = useRouter();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Form states matching fields
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("United States (US)");
  const [stateName, setStateName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Avatar upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mounted state for portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Country calling code picker state & position
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    left: 0,
    width: 320,
    maxHeight: 280,
  });

  const updateDropdownPosition = () => {
    if (!pickerRef.current) return;
    const rect = pickerRef.current.getBoundingClientRect();
    const dropdownHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    const width = 320;
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));

    if (openUpward) {
      setDropdownPos({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width,
        maxHeight: Math.min(280, Math.max(160, spaceAbove)),
      });
    } else {
      setDropdownPos({
        top: rect.bottom + 6,
        left,
        width,
        maxHeight: Math.min(280, Math.max(160, spaceBelow)),
      });
    }
  };

  // Close country picker on click outside, resize, scroll, or Escape
  useEffect(() => {
    if (!countryPickerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCountryPickerOpen(false);
        setSearchQuery("");
      }
    };
    const handleScrollOrResize = () => {
      updateDropdownPosition();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [countryPickerOpen]);

  // Load user data on mount
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId != null) {
      fetchUserProfile(userId)
        .then((user) => {
          setUserProfile(user);
          setProfileName(user.profileName?.trim() || user.username || "");
          setBio(user.profileDescription || "");
          setGender(user.gender || "");

          if (user.phone) {
            const parsed = parsePhoneNumber(user.phone);
            setSelectedCountryCode(parsed.country);
            setPhoneNumber(parsed.localNumber);
          }

          if (user.country) {
            setCountry(user.country);
          }
          if (user.state) {
            setStateName(user.state);
          }
          if (user.birthDate) {
            setBirthDate(user.birthDate.split("T")[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
          toast.error("Failed to load profile details.");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Handle avatar selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  // Filtered countries for phone code selector
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Current avatar URL
  const rawPicture = userProfile?.profilePicture;
  const avatarUrl = previewUrl
    ? previewUrl
    : rawPicture && !imgError
      ? rawPicture.startsWith("http")
        ? rawPicture
        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${rawPicture}`
      : "/default-avatar.png";

  const displayName = profileName.trim() || userProfile?.username || "User";
  const personaLabel = userProfile?.profileLabel?.trim() || "Funny Cuentter";

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const fullPhone = phoneNumber.trim()
        ? `${selectedCountryCode.dialCode} ${phoneNumber.trim()}`
        : "";

      const updatePayload = {
        username: userProfile?.username,
        profileName: profileName.trim() || userProfile?.username,
        profileDescription: bio.trim(),
        profileLabel: personaLabel,
        gender: gender.trim(),
        phone: fullPhone,
        country: country.trim(),
        state: stateName.trim(),
        birthDate: birthDate.trim(),
      };

      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("data", JSON.stringify(updatePayload));

      const success = await updateUserProfile(formData);
      if (success) {
        toast.success("Profile updated successfully!");
        router.push("/profile");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      toast.error("An error occurred while updating profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-[840px] mx-auto min-w-0 px-3.5 sm:px-6 py-4 sm:py-6 overflow-x-hidden pb-20">
      {/* Top Navigation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-light-gray/70 w-full min-w-0 relative">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back to profile"
          className="inline-flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-gray hover:text-subtle-black transition-colors cursor-pointer py-1 -ml-1"
        >
          <BackIcon width={9} height={16} className="text-current" />
          <span>Profile</span>
        </button>

        <h1 className="text-[17px] sm:text-[19px] font-bold text-subtle-black tracking-tight text-center flex-1 pr-6">
          Edit Profile
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6 w-full">
        {/* Card 1: Avatar & Identity Header Card (Peach Gradient matching profile aesthetic) */}
        <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[24px] border border-light-gray/80 bg-gradient-to-r from-[#FFF8F3] via-white to-white p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          {/* Peach decorative curved shape behind avatar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 sm:-left-6 top-0 bottom-0 w-[110px] sm:w-[150px] bg-[#FFD5BF] rounded-r-[110px] opacity-90 z-0"
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Camera Overlay */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-[96px] h-[96px] sm:w-[104px] sm:h-[104px] rounded-full border-4 border-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] overflow-hidden bg-white cursor-pointer group shrink-0 transition-transform duration-200 hover:scale-[1.02]"
              >
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  sizes="104px"
                  priority
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium">
                  <Camera size={20} className="mb-0.5" />
                  <span>Change</span>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Persona Pill */}
              <span className="inline-flex items-center justify-center rounded-full bg-[#806A60] px-3 py-0.5 text-[11px] font-medium text-white shadow-xs">
                {personaLabel}
              </span>
            </div>

            {/* Name, Handle & Change Picture button */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-0 pt-0.5 sm:pt-1">
              <h2 className="text-[20px] sm:text-[24px] font-bold text-subtle-black leading-tight break-words">
                {displayName}
              </h2>
              {userProfile?.username && (
                <p className="text-[13px] sm:text-[14px] font-medium text-gray mt-0.5">
                  @{userProfile.username}
                </p>
              )}

              <div className="mt-3.5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-violet/30 bg-violet/5 px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold text-violet hover:bg-violet hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Change Photo</span>
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    className="text-[12px] text-gray hover:text-red transition-colors cursor-pointer px-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Profile Details (Name & Bio) */}
        <div className="rounded-[20px] sm:rounded-[24px] border border-light-gray/80 bg-white p-5 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-1 border-b border-light-gray/50">
            <User size={17} className="text-violet shrink-0" />
            <h3 className="text-[15px] sm:text-[16px] font-bold text-subtle-black">
              Profile Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-1">
            {/* Display Name Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profile-name" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-[46px] px-3.5 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all placeholder:text-gray/50"
              />
            </div>

            {/* Bio Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="bio-input" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                  Bio
                </label>
                <span className="text-[11px] text-gray">
                  {bio.length}/500
                </span>
              </div>
              <textarea
                id="bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others a little about yourself, your writing style, or interests..."
                rows={3}
                maxLength={500}
                className="w-full p-3.5 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all leading-relaxed placeholder:text-gray/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Personal Settings (Email, Gender, Phone, Country, State, Birth Date) */}
        <div className="rounded-[20px] sm:rounded-[24px] border border-light-gray/80 bg-white p-5 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-light-gray/50">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-violet shrink-0" />
              <h3 className="text-[15px] sm:text-[16px] font-bold text-subtle-black">
                Personal Settings
              </h3>
            </div>
            <span className="text-[11px] text-gray hidden sm:inline">
              Private information
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-1">
            {/* Email Field (Disabled / Read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] sm:text-[13px] font-semibold text-subtle-black flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-gray font-normal flex items-center gap-1">
                  <Lock size={11} /> Read only
                </span>
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-gray pointer-events-none" />
                <input
                  type="email"
                  value={userProfile?.email || ""}
                  disabled
                  readOnly
                  className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-light-gray/80 bg-gray-6/60 text-[14px] text-gray cursor-not-allowed outline-none select-none"
                />
              </div>
            </div>

            {/* Gender Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="gender-select" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                Gender
              </label>
              <div className="relative flex items-center">
                <select
                  id="gender-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-[46px] px-3.5 pr-9 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-gray">
                    Select your Gender
                  </option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} className="absolute right-3.5 text-gray pointer-events-none" />
              </div>
            </div>

            {/* Phone Number Field with ALL Country Calling Codes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone-input" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                Phone Number
              </label>
              <div className="relative flex items-center rounded-[12px] border border-light-gray bg-white focus-within:border-violet focus-within:ring-3 focus-within:ring-violet/10 transition-all" ref={pickerRef}>
                {/* Country Code Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!countryPickerOpen) {
                      updateDropdownPosition();
                    }
                    setCountryPickerOpen((prev) => !prev);
                  }}
                  aria-label="Select country calling code"
                  className="flex items-center gap-1.5 px-3 h-[44px] bg-light-beige/40 hover:bg-light-beige/80 border-r border-light-gray rounded-l-[11px] text-[13px] font-medium text-subtle-black cursor-pointer transition-colors shrink-0"
                >
                  <span className="text-[16px]">{selectedCountryCode.flag}</span>
                  <span>{selectedCountryCode.dialCode}</span>
                  <ChevronDown size={14} className="text-gray" />
                </button>

                {/* Local Phone Input */}
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 min-w-0 h-[44px] px-3 text-[14px] text-subtle-black outline-none bg-transparent placeholder:text-gray/50"
                />
              </div>
            </div>

            {/* Country Picker Portal: Rendered in document.body to prevent parent clipping and page scrollbar */}
            {mounted &&
              countryPickerOpen &&
              createPortal(
                <div className="fixed inset-0 z-[9999] pointer-events-auto">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/25 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none transition-opacity"
                    onClick={() => {
                      setCountryPickerOpen(false);
                      setSearchQuery("");
                    }}
                  />

                  {/* Mobile View: Bottom Sheet (< sm) */}
                  <div className="sm:hidden fixed inset-x-0 bottom-0 z-[10000] max-h-[75vh] bg-white rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
                    <div className="w-12 h-1.5 bg-light-gray rounded-full mx-auto mb-3 shrink-0" />

                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-light-gray/60 shrink-0">
                      <h3 className="text-[16px] font-bold text-subtle-black">
                        Select Country Calling Code
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setCountryPickerOpen(false);
                          setSearchQuery("");
                        }}
                        className="p-1.5 text-gray hover:text-subtle-black rounded-full hover:bg-light-gray/30 cursor-pointer"
                        aria-label="Close country selector"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="relative mb-2 shrink-0">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full h-[40px] pl-9 pr-3 text-[14px] bg-light-beige/50 rounded-[10px] border border-light-gray outline-none focus:border-violet focus:ring-2 focus:ring-violet/10"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col overflow-y-auto flex-1 divide-y divide-light-gray/30 -mx-1 px-1">
                      {filteredCountries.length === 0 ? (
                        <p className="text-[13px] text-gray text-center py-6">
                          No country found
                        </p>
                      ) : (
                        filteredCountries.map((c) => {
                          const isSelected = c.code === selectedCountryCode.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountryCode(c);
                                setCountryPickerOpen(false);
                                setSearchQuery("");
                              }}
                              className={`flex items-center justify-between px-3 py-2.5 text-[14px] text-left hover:bg-light-beige/80 transition-colors rounded-[8px] cursor-pointer ${
                                isSelected ? "bg-violet/5 font-semibold text-violet" : "text-subtle-black"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="text-[18px]">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-gray text-[13px]">{c.dialCode}</span>
                                {isSelected && <Check size={16} className="text-violet" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tablet & Desktop View: Anchored Fixed Popover (>= sm) */}
                  <div
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      bottom: dropdownPos.bottom,
                      left: dropdownPos.left,
                      width: dropdownPos.width,
                      maxHeight: dropdownPos.maxHeight,
                    }}
                    className="hidden sm:flex z-[10000] bg-white rounded-[16px] border border-light-gray shadow-[0_16px_40px_rgba(0,0,0,0.14)] flex-col p-2 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                  >
                    <div className="relative mb-2 shrink-0">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full h-[36px] pl-8 pr-3 text-[13px] bg-light-beige/40 rounded-[8px] border border-light-gray outline-none focus:border-violet"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col overflow-y-auto flex-1 divide-y divide-light-gray/30">
                      {filteredCountries.length === 0 ? (
                        <p className="text-[12px] text-gray text-center py-4">
                          No country found
                        </p>
                      ) : (
                        filteredCountries.map((c) => {
                          const isSelected = c.code === selectedCountryCode.code;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountryCode(c);
                                setCountryPickerOpen(false);
                                setSearchQuery("");
                              }}
                              className={`flex items-center justify-between px-2.5 py-2 text-[13px] text-left hover:bg-light-beige/70 transition-colors rounded-[8px] cursor-pointer ${
                                isSelected ? "bg-violet/5 font-semibold text-violet" : "text-subtle-black"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[16px]">{c.flag}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <span className="text-gray text-[12px]">{c.dialCode}</span>
                                {isSelected && <Check size={14} className="text-violet" />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>,
                document.body
              )}

            {/* Country Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="country-select" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                Country
              </label>
              <div className="relative flex items-center">
                <Globe size={16} className="absolute left-3.5 text-gray pointer-events-none" />
                <select
                  id="country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-9 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all appearance-none cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={`${c.name} (${c.code})`}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} className="absolute right-3.5 text-gray pointer-events-none" />
              </div>
            </div>

            {/* State / Province Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="state-input" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                State / Province
              </label>
              <div className="relative flex items-center">
                <MapPin size={16} className="absolute left-3.5 text-gray pointer-events-none" />
                <input
                  id="state-input"
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Texas"
                  className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all placeholder:text-gray/50"
                />
              </div>
            </div>

            {/* Birth Date Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="birthdate-input" className="text-[12px] sm:text-[13px] font-semibold text-subtle-black">
                Birth Date
              </label>
              <div className="relative flex items-center">
                <Calendar size={16} className="absolute left-3.5 text-gray pointer-events-none" />
                <input
                  id="birthdate-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-[46px] pl-10 pr-3.5 rounded-[12px] border border-light-gray bg-white text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-3 focus:ring-violet/10 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href="/profile"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-light-gray bg-white hover:bg-light-beige/60 text-gray hover:text-subtle-black font-semibold text-[14px] text-center transition-colors cursor-pointer"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-violet hover:bg-dark-violet text-white font-semibold text-[14px] sm:text-[15px] transition-all shadow-[0_4px_16px_rgba(93,77,190,0.25)] hover:shadow-[0_6px_22px_rgba(93,77,190,0.35)] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>Update Profile Information</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default checkAuth(EditProfilePage);
