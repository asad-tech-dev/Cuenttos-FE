"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile, updateUserProfile } from "@/lib/api/profile";
import { toast } from "sonner";
import { Camera, User, FileText, Phone, Calendar } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [profileName, setProfileName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user && open) {
      setProfileName(user.profileName || "");
      setBio(user.profileDescription || "");
      setPhone(user.phone || "");
      setGender(user.gender || "");
      setBirthDate(user.birthDate || "");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [user, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const currentPicture = previewUrl
    ? previewUrl
    : user?.profilePicture
      ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.profilePicture}`
      : "/default-avatar.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Profile name is required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const updatePayload = {
        username: user?.username,
        profileName: profileName.trim(),
        profileDescription: bio.trim(),
        phone: phone.trim(),
        gender: gender.trim(),
        birthDate: birthDate.trim(),
      };

      formData.append("data", JSON.stringify(updatePayload));

      await updateUserProfile(formData);

      toast.success("Profile updated successfully!");
      if (user) {
        onProfileUpdated({
          ...user,
          profileName: profileName.trim(),
          profileDescription: bio.trim(),
          phone: phone.trim(),
          gender: gender.trim(),
          birthDate: birthDate.trim(),
          ...(previewUrl ? { profilePicture: previewUrl } : {}),
        });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-light-gray w-[calc(100vw-32px)] sm:w-full max-w-[500px] p-5 sm:p-7 rounded-[20px] sm:rounded-[24px] max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <DialogHeader className="pb-2 border-b border-light-gray/60">
          <DialogTitle className="text-[20px] sm:text-[22px] font-bold text-subtle-black text-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2 sm:mt-3">
          {/* Avatar with hover camera overlay */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-[86px] h-[86px] sm:w-[96px] sm:h-[96px] rounded-full border-4 border-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] overflow-hidden bg-light-gray/40 cursor-pointer group"
            >
              <Image
                src={currentPicture}
                alt="Profile preview"
                fill
                sizes="96px"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-medium">
                <Camera size={18} className="mb-0.5" />
                Change
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[12px] sm:text-[13px] font-semibold text-violet hover:text-dark-violet transition-colors cursor-pointer"
            >
              Change Photo
            </button>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] sm:text-[12px] font-bold text-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} />
                Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                className="h-[42px] sm:h-[46px] px-3.5 sm:px-4 rounded-[10px] sm:rounded-[12px] border border-light-gray text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] sm:text-[12px] font-bold text-dark-gray uppercase tracking-wider">
                Pseudonym / Handle
              </label>
              <input
                type="text"
                value={user?.username ? `@${user.username}` : ""}
                disabled
                className="h-[42px] sm:h-[46px] px-3.5 sm:px-4 rounded-[10px] sm:rounded-[12px] border border-light-gray bg-gray-6 text-[14px] text-gray cursor-not-allowed font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] sm:text-[12px] font-bold text-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short bio..."
                rows={3}
                maxLength={500}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] border border-light-gray text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 resize-none transition-all leading-relaxed"
              />
              <span className="text-[10px] sm:text-[11px] text-gray text-right">
                {bio.length}/500
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] sm:text-[12px] font-bold text-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} />
                  Phone (optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-[42px] sm:h-[46px] px-3.5 sm:px-4 rounded-[10px] sm:rounded-[12px] border border-light-gray text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] sm:text-[12px] font-bold text-dark-gray uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} />
                  Birth Date (optional)
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-[42px] sm:h-[46px] px-3.5 sm:px-4 rounded-[10px] sm:rounded-[12px] border border-light-gray text-[14px] text-subtle-black outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 mt-1 pt-3 sm:pt-4 border-t border-light-gray">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-[40px] px-4 rounded-[10px] sm:rounded-[12px] text-[13px] font-semibold text-gray hover:text-subtle-black hover:bg-light-gray/40 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-[40px] px-5 sm:px-6 rounded-[10px] sm:rounded-[12px] bg-violet hover:bg-dark-violet text-white text-[13px] font-semibold cursor-pointer shadow-[0_4px_14px_rgba(93,77,190,0.3)] transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
