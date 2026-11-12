"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "cn";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Camera,
  Check,
  Eye,
  FileText,
  Globe,
  ImageIcon,
  Info,
  Landmark,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PanoramaViewer } from "@/components/panorama/panorama-viewer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { convertHeicToJpeg, getImageDimensions, isHeicFile, resizeImageIfNeeded } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABELS, type HeritageCategory, type HeritageSite } from "@/types/heritage";

import { saveHeritageSite } from "../actions";

export const DAET_BARANGAYS = [
  "Alawihao",
  "Awitan",
  "Bagasbas",
  "Bibirao",
  "Borabod",
  "Calasgasan",
  "Camambugan",
  "Cobangbang",
  "Dogongan",
  "Gahonon",
  "Gubat",
  "Lag-on",
  "Magang",
  "Mambalite",
  "Mancruz",
  "Pamorangon",
  "Barangay I (San Francisco)",
  "Barangay II (San Vicente)",
  "Barangay III (Bagumbayan)",
  "Barangay IV (Poblacion)",
  "Barangay V (Poblacion)",
  "Barangay VI (Poblacion)",
  "Barangay VII (Poblacion)",
  "Barangay VIII (Poblacion)",
  "San Isidro",
];

export const CAMARINES_NORTE_MUNICIPALITIES = [
  "Daet",
  "Basud",
  "Capalonga",
  "Jose Panganiban",
  "Labo",
  "Mercedes",
  "Paracale",
  "San Lorenzo Ruiz",
  "San Vicente",
  "Santa Elena",
  "Talisay",
  "Vinzons",
];

export interface FormPanoramaItem {
  id?: string;
  label: string;
  panorama_url: string;
  sort_order: number;
}

export interface FormSectionItem {
  id: string;
  label: string;
  content: string;
}

interface HeritageSiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: HeritageSite | null;
  onSuccess: () => void;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function HeritageSiteFormDialog({ open, onOpenChange, site, onSuccess }: HeritageSiteFormDialogProps) {
  const isEditing = Boolean(site?.id);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState<HeritageCategory>("historical");
  const [barangay, setBarangay] = useState("Barangay IV (Poblacion)");
  const [municipality, setMunicipality] = useState("Daet");
  const [province, setProvince] = useState("Camarines Norte");
  const [shortDescription, setShortDescription] = useState("");
  const [historicalContext, setHistoricalContext] = useState("");
  const [additionalSections, setAdditionalSections] = useState<FormSectionItem[]>([]);
  const [yearBuilt, setYearBuilt] = useState("");
  const [latitude, setLatitude] = useState<string>("14.1122");
  const [longitude, setLongitude] = useState<string>("122.9553");
  const [isPublished, setIsPublished] = useState(true);

  // Active tab state & animated height transition
  const [activeTab, setActiveTab] = useState("general");
  const [tabHeight, setTabHeight] = useState<number | undefined>(undefined);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tab change handler with animated height transition
  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab) return;
    setIsTransitioning(true);
    setActiveTab(nextTab);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 350);
  };

  // Media state
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [panoramas, setPanoramas] = useState<FormPanoramaItem[]>([]);
  const [selectedTheaterIndex, setSelectedTheaterIndex] = useState(0);

  // Uploading state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadingPanoIndex, setUploadingPanoIndex] = useState<number | null>(null);
  const [isUploadingNewPano, setIsUploadingNewPano] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Field validation & safety confirmation state
  const [fieldErrors, setFieldErrors] = useState<{
    title?: boolean;
    slug?: boolean;
    overview?: boolean;
    history?: boolean;
  }>({});
  const [showNoMediaConfirmDialog, setShowNoMediaConfirmDialog] = useState(false);

  // Tab completion status cues
  const isTab1Complete = Boolean(title.trim() && slug.trim());
  const isTab2Complete = Boolean(shortDescription.trim() && historicalContext.trim());
  const mediaCount =
    (coverImageUrl ? 1 : 0) + panoramas.filter((p) => Boolean(p.panorama_url?.trim())).length + galleryImages.length;
  const hasMedia = mediaCount > 0;

  // Measure tab container height dynamically for smooth transitions
  useEffect(() => {
    if (!open) {
      setActiveTab("general");
      setTabHeight(undefined);
      setIsTransitioning(false);
      return;
    }

    const updateHeight = () => {
      if (tabContentRef.current) {
        const height = tabContentRef.current.offsetHeight;
        if (height > 0) {
          setTabHeight(height);
        }
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });

    if (tabContentRef.current) {
      ro.observe(tabContentRef.current);
    }

    return () => {
      ro.disconnect();
    };
  }, [open, activeTab]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Sync state when editing or resetting
  useEffect(() => {
    if (site) {
      setTitle(site.title || "");
      setSlug(site.slug || "");
      setIsSlugManuallyEdited(true);
      setCategory(site.category || "historical");
      setBarangay(site.barangay || "Barangay IV (Poblacion)");
      setMunicipality(site.municipality || "Daet");
      setProvince(site.province || "Camarines Norte");
      setShortDescription(site.short_description || "");
      setHistoricalContext(site.historical_context || "");
      setYearBuilt(site.year_built || "");
      setLatitude(site.latitude !== null && site.latitude !== undefined ? String(site.latitude) : "");
      setLongitude(site.longitude !== null && site.longitude !== undefined ? String(site.longitude) : "");
      setIsPublished(site.is_published ?? true);
      setCoverImageUrl(site.cover_image_url || "");
      setGalleryImages(site.gallery_images ?? []);

      // Initialize repeatable additional sections
      if (site.additional_sections && site.additional_sections.length > 0) {
        setAdditionalSections(
          site.additional_sections.map((s, idx) => ({
            id: s.id || `sec-${idx}-${Date.now()}`,
            label: s.label || "",
            content: s.content || "",
          })),
        );
      } else if (site.significance && site.significance.trim()) {
        setAdditionalSections([
          {
            id: `legacy-sig-${Date.now()}`,
            label: "Cultural Significance",
            content: site.significance,
          },
        ]);
      } else {
        setAdditionalSections([]);
      }

      // Initialize multi-panoramas
      if (site.panoramas && site.panoramas.length > 0) {
        setPanoramas(
          site.panoramas.map((p, idx) => ({
            id: p.id,
            label: p.label || (idx === 0 ? "Main View" : `Perspective ${idx + 1}`),
            panorama_url: p.panorama_url || "",
            sort_order: p.sort_order ?? idx,
          })),
        );
      } else if (site.panorama_360_url && !site.panorama_360_url.includes("milan.jpg")) {
        setPanoramas([
          {
            id: "legacy",
            label: "Main View",
            panorama_url: site.panorama_360_url,
            sort_order: 0,
          },
        ]);
      } else {
        setPanoramas([]);
      }
      setSelectedTheaterIndex(0);
      setFieldErrors({});
      setShowNoMediaConfirmDialog(false);
    } else {
      // Defaults for new site
      setTitle("");
      setSlug("");
      setIsSlugManuallyEdited(false);
      setCategory("historical");
      setBarangay("Barangay IV (Poblacion)");
      setMunicipality("Daet");
      setProvince("Camarines Norte");
      setShortDescription("");
      setHistoricalContext("");
      setAdditionalSections([]);
      setYearBuilt("");
      setLatitude("14.1122");
      setLongitude("122.9553");
      setIsPublished(true);
      setCoverImageUrl("");
      setGalleryImages([]);
      setPanoramas([]);
      setSelectedTheaterIndex(0);
      setFieldErrors({});
      setShowNoMediaConfirmDialog(false);
    }
  }, [site, open]);

  // Title change with auto-slug
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newTitle));
    }
  };

  // Direct Supabase storage upload helper
  const uploadFileToStorage = async (file: File, folder: "covers" | "panoramas" | "gallery"): Promise<string> => {
    const supabase = createClient();
    const cleanSlug = slug || "site";

    // Auto-convert Apple HEIC/HEIF images to JPEG for universal browser compatibility
    let fileToUpload = file;
    if (isHeicFile(file)) {
      fileToUpload = await convertHeicToJpeg(file);
    }

    const fileExt = fileToUpload.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${cleanSlug}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("heritage-media").upload(fileName, fileToUpload, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("heritage-media").getPublicUrl(fileName);

    return publicUrl;
  };

  // Cover image file handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      if (isHeicFile(file)) {
        toast.info("Converting Apple HEIC photo to JPEG for web compatibility...");
      }
      const url = await uploadFileToStorage(file, "covers");
      setCoverImageUrl(url);
      toast.success("Cover image uploaded to Supabase Storage");
    } catch (err: unknown) {
      console.error("Cover upload error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload cover image. You can also paste an image URL directly.",
      );
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  // Multi-Panorama handlers
  const handleAddPanorama = () => {
    const newIdx = panoramas.length;
    setPanoramas((prev) => [
      ...prev,
      {
        label: newIdx === 0 ? "Main Exterior View" : `Perspective ${newIdx + 1}`,
        panorama_url: "",
        sort_order: newIdx,
      },
    ]);
    setSelectedTheaterIndex(newIdx);
  };

  const handleUpdatePanorama = (index: number, field: "label" | "panorama_url", value: string) => {
    setPanoramas((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleRemovePanorama = (index: number) => {
    setPanoramas((prev) => prev.filter((_, i) => i !== index).map((p, idx) => ({ ...p, sort_order: idx })));
    if (selectedTheaterIndex >= index && selectedTheaterIndex > 0) {
      setSelectedTheaterIndex((prev) => prev - 1);
    }
  };

  const handleMovePanorama = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= panoramas.length) return;

    setPanoramas((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((p, idx) => ({ ...p, sort_order: idx }));
    });

    if (selectedTheaterIndex === index) {
      setSelectedTheaterIndex(targetIndex);
    } else if (selectedTheaterIndex === targetIndex) {
      setSelectedTheaterIndex(index);
    }
  };

  const handleUploadPanoramaFile = async (e: React.ChangeEvent<HTMLInputElement>, targetIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const entryPoint =
      targetIndex !== undefined
        ? `Perspective Card #${targetIndex + 1} (${panoramas[targetIndex]?.label || "Untitled"})`
        : `Quick 'Upload 360 File' Button (Adding Perspective #${panoramas.length + 1})`;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    let originalDimensions: { width: number; height: number } | null = null;
    let fileToUpload = file;

    try {
      if (targetIndex !== undefined) {
        setUploadingPanoIndex(targetIndex);
      } else {
        setIsUploadingNewPano(true);
      }

      if (isHeicFile(file)) {
        toast.info("Converting Apple HEIC panorama to JPEG...");
        fileToUpload = await convertHeicToJpeg(file);
      }

      // Validate dimensions & auto-resize large equirectangular images
      try {
        const dimensions = await getImageDimensions(fileToUpload);
        originalDimensions = dimensions;
        const { width, height } = dimensions;
        const aspectRatio = width / height;

        // Diagnostic notice for horizontal strip panoramas (e.g. iPhone standard Pano mode)
        if (aspectRatio > 2.6 || aspectRatio < 1.4) {
          toast.warning(
            `Paalala sa Format: Ang litrato ay isang panoramic strip (${width}×${height}px, ratio ${aspectRatio.toFixed(1)}:1), hindi 2:1 full sphere. Binabanat ito ng 360 viewer sa buong sphere kaya maaaring magmukhang malabo. Para sa pinakamalinaw na 360 sa iPhone, gumamit ng 360 camera app na kumukuha ng buong sphere (kasama kisame at sahig).`,
            { duration: 9000 },
          );
        }

        // Keep original files untouched up to 8K (8192×4096) for maximum crystal-clear resolution.
        // Only optimize if image is massive (greater than 8K width or 4K height).
        if (width > 8192 || height > 4096) {
          toast.info(
            `Napakalaki ng litrato (${width}×${height}px). Ino-optimize sa 8K (8192×4096) na may 95% ultra-high quality upang mapanatili ang buong linaw...`,
            { duration: 5000 },
          );

          const resizeResult = await resizeImageIfNeeded(file, 8192, 4096, 0.95);
          if (resizeResult.wasResized) {
            fileToUpload = resizeResult.file;
            toast.success(
              `High-definition 360° image ready: ${resizeResult.newDimensions.width}×${resizeResult.newDimensions.height}px`,
              { duration: 4000 },
            );
          }
        }
      } catch (dimErr) {
        console.error(
          `❌ [360° Panorama Resize / Inspection Failure]\n` +
            `• File Name: ${file.name}\n` +
            `• Original Dimensions: ${originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}px` : "Failed to inspect"}\n` +
            `• File Size: ${fileSizeMB} MB (${file.size} bytes)\n` +
            `• Upload Entry Point: ${entryPoint}\n` +
            `• Error Message: ${dimErr instanceof Error ? dimErr.message : String(dimErr)}\n` +
            `• Stack Trace: ${dimErr instanceof Error && dimErr.stack ? dimErr.stack : "N/A"}\n` +
            `• Full Error Object:`,
          dimErr,
        );
      }

      toast.info("Uploading 360° panorama... Large files may take a few moments.");
      const url = await uploadFileToStorage(fileToUpload, "panoramas");

      if (targetIndex !== undefined) {
        handleUpdatePanorama(targetIndex, "panorama_url", url);
        toast.success("360° panorama updated!");
      } else {
        const newIdx = panoramas.length;
        const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setPanoramas((prev) => [
          ...prev,
          {
            label: defaultName || (newIdx === 0 ? "Main Exterior View" : `Perspective ${newIdx + 1}`),
            panorama_url: url,
            sort_order: newIdx,
          },
        ]);
        setSelectedTheaterIndex(newIdx);
        toast.success("New 360° perspective added!");
      }
    } catch (err: unknown) {
      console.error(
        `❌ [360° Panorama Upload / Processing Failure]\n` +
          `• File Name: ${file.name}\n` +
          `• Original Dimensions: ${originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}px` : "Unknown / Uninspected"}\n` +
          `• File Size: ${fileSizeMB} MB (${file.size} bytes)\n` +
          `• Upload Entry Point: ${entryPoint}\n` +
          `• Error Message: ${err instanceof Error ? err.message : String(err)}\n` +
          `• Stack Trace: ${err instanceof Error && err.stack ? err.stack : "N/A"}\n` +
          `• Full Error Object:`,
        err,
      );
      toast.error(err instanceof Error ? err.message : "Failed to upload panorama.");
    } finally {
      setUploadingPanoIndex(null);
      setIsUploadingNewPano(false);
      e.target.value = "";
    }
  };

  // Additional Sections handlers
  const handleAddSection = () => {
    setAdditionalSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: "",
        content: "",
      },
    ]);
  };

  const handleUpdateSection = (index: number, field: "label" | "content", value: string) => {
    setAdditionalSections((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleRemoveSection = (index: number) => {
    setAdditionalSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= additionalSections.length) return;
    setAdditionalSections((prev) => {
      const next = [...prev];
      const item = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = item;
      return next;
    });
  };

  // Gallery multi-file handler (Bulk parallel upload)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    try {
      setIsUploadingGallery(true);
      const hasHeic = files.some(isHeicFile);
      if (hasHeic) {
        toast.info("Converting Apple HEIC photo(s) to JPEG for web compatibility...");
      }
      toast.info(`Uploading ${files.length} gallery photo(s)...`);
      const uploadPromises = files.map((file) => uploadFileToStorage(file, "gallery"));
      const urls = await Promise.all(uploadPromises);
      setGalleryImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} gallery image(s) uploaded successfully!`);
    } catch (err: unknown) {
      console.error("Gallery upload error:", err);
      toast.error(err instanceof Error ? err.message : "Error uploading gallery images");
    } finally {
      setIsUploadingGallery(false);
      e.target.value = "";
    }
  };

  // Dedicated save execution function (supports direct submit and confirmation modal paths)
  const executeSaveSite = async (targetPublishedStatus: boolean) => {
    try {
      setIsSaving(true);
      const primaryUrl = panoramas.length > 0 && panoramas[0].panorama_url ? panoramas[0].panorama_url : null;
      const filteredSections = additionalSections
        .filter((s) => s.label.trim() || s.content.trim())
        .map((s) => ({
          label: s.label.trim() || "Details",
          content: s.content.trim(),
        }));

      const res = await saveHeritageSite({
        id: site?.id,
        title: title.trim(),
        slug: slug.trim(),
        category,
        barangay,
        municipality,
        province,
        short_description: shortDescription.trim(),
        historical_context: historicalContext.trim(),
        significance: filteredSections.find((s) => s.label.toLowerCase().includes("significance"))?.content || null,
        additional_sections: filteredSections,
        year_built: yearBuilt.trim(),
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
        cover_image_url: coverImageUrl || null,
        gallery_images: galleryImages,
        panorama_360_url: primaryUrl,
        panoramas: panoramas.map((p, idx) => ({
          panorama_url: p.panorama_url,
          label: p.label.trim() || (idx === 0 ? "Main View" : `Perspective ${idx + 1}`),
          sort_order: idx,
        })),
        is_published: targetPublishedStatus,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save heritage site");
        return;
      }

      toast.success(isEditing ? "Heritage site updated successfully" : "New heritage site created!");
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("daet_heritage_sync");
        bc.postMessage({ type: "SITES_UPDATED" });
        bc.close();
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Form submit error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save site");
    } finally {
      setIsSaving(false);
    }
  };

  // Submit handler with automatic tab switching and field focusing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation for Tab 1 (General & Location)
    if (!title.trim()) {
      setFieldErrors((prev) => ({ ...prev, title: true }));
      setActiveTab("general");
      setTimeout(() => {
        const el = document.getElementById("title");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      toast.error("Please enter the Site Title (Required in Tab 1)");
      return;
    }

    if (!slug.trim()) {
      setFieldErrors((prev) => ({ ...prev, slug: true }));
      setActiveTab("general");
      setTimeout(() => {
        const el = document.getElementById("slug");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      toast.error("Please enter the URL Slug (Required in Tab 1)");
      return;
    }

    // 2. Validation for Tab 2 (Historical Narrative)
    if (!shortDescription.trim()) {
      setFieldErrors((prev) => ({ ...prev, overview: true }));
      setActiveTab("narrative");
      setTimeout(() => {
        const el = document.getElementById("overview");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      toast.error("Please enter the Overview summary (Required in Tab 2)");
      return;
    }

    if (!historicalContext.trim()) {
      setFieldErrors((prev) => ({ ...prev, history: true }));
      setActiveTab("narrative");
      setTimeout(() => {
        const el = document.getElementById("history");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      toast.error("Please enter the History chronicle (Required in Tab 2)");
      return;
    }

    // 3. Tab 3 is OPTIONAL.
    // If published is ON, check if both cover photo and 360 panorama are missing:
    const hasCover = Boolean(coverImageUrl?.trim());
    const hasPano = panoramas.some((p) => Boolean(p.panorama_url?.trim()));

    if (isPublished && !hasCover && !hasPano) {
      setShowNoMediaConfirmDialog(true);
      return;
    }

    // Proceed to save
    await executeSaveSite(isPublished);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-[96vw] sm:max-w-[94vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto border-[#c5a059]/30 bg-card p-6 shadow-2xl transition-[max-height] duration-300 ease-out">
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader className="border-b border-border/60 pb-4 pr-10">
              <div className="flex items-center gap-2 text-[#c5a059]">
                <Landmark className="size-5" />
                <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                  {isEditing ? "Edit Heritage Site Record" : "Add New Heritage Site"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage architectural, historical, and photogrammetry assets for Daet Cultural Heritage catalogue.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
              <TabsList className="grid grid-cols-3 bg-muted/60 h-11 sm:h-12 p-1 rounded-lg">
                {/* Tab 1 Trigger */}
                <TabsTrigger
                  value="general"
                  className="text-xs sm:text-sm font-medium gap-1.5 sm:gap-2 px-1.5 sm:px-2 flex items-center justify-center cursor-pointer"
                >
                  <MapPin className="size-4 text-[#c5a059] shrink-0" />
                  <span className="truncate">1. General & Location</span>
                  {isTab1Complete ? (
                    <span
                      className="inline-flex items-center justify-center size-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] shrink-0"
                      title="Required fields completed in Tab 1"
                    >
                      <Check className="size-2.5" />
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center justify-center size-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] shrink-0"
                      title="Required fields pending in Tab 1"
                    >
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                    </span>
                  )}
                </TabsTrigger>

                {/* Tab 2 Trigger */}
                <TabsTrigger
                  value="narrative"
                  className="text-xs sm:text-sm font-medium gap-1.5 sm:gap-2 px-1.5 sm:px-2 flex items-center justify-center cursor-pointer"
                >
                  <FileText className="size-4 text-[#c5a059] shrink-0" />
                  <span className="truncate">2. Historical Narrative</span>
                  {isTab2Complete ? (
                    <span
                      className="inline-flex items-center justify-center size-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] shrink-0"
                      title="Required fields completed in Tab 2"
                    >
                      <Check className="size-2.5" />
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center justify-center size-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] shrink-0"
                      title="Required fields pending in Tab 2"
                    >
                      <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                    </span>
                  )}
                </TabsTrigger>

                {/* Tab 3 Trigger */}
                <TabsTrigger
                  value="media"
                  className="text-xs sm:text-sm font-medium gap-1.5 sm:gap-2 px-1.5 sm:px-2 flex items-center justify-center cursor-pointer"
                >
                  <Eye className="size-4 text-[#c5a059] shrink-0" />
                  <span className="truncate">3. Media & 360° View</span>
                  {hasMedia ? (
                    <span
                      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono shrink-0"
                      title={`${mediaCount} media attached`}
                    >
                      <Check className="size-2.5 mr-0.5" />
                      {mediaCount}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/80 text-[10px] font-mono shrink-0"
                      title="Media assets are optional in Tab 3"
                    >
                      Optional
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Smooth animated height container */}
              <div
                className="transition-[height] duration-300 ease-in-out"
                style={{
                  height: tabHeight !== undefined ? `${tabHeight}px` : "auto",
                  overflow: isTransitioning ? "hidden" : "visible",
                }}
                onTransitionEnd={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsTransitioning(false);
                  }
                }}
              >
                <div ref={tabContentRef}>
                  {/* TAB 1: General & Location */}
                  <TabsContent value="general" className="space-y-5 pt-4 m-0 animate-in fade-in-50 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-medium flex items-center justify-between">
                          <span>
                            Site Title <span className="text-destructive">*</span>
                          </span>
                          {fieldErrors.title && (
                            <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              Required
                            </span>
                          )}
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => {
                            handleTitleChange(e.target.value);
                            if (fieldErrors.title && e.target.value.trim()) {
                              setFieldErrors((prev) => ({ ...prev, title: false }));
                            }
                          }}
                          placeholder="e.g. First Rizal Monument"
                          className={cn(fieldErrors.title && "border-destructive focus-visible:ring-destructive/40")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="slug" className="text-xs font-medium flex items-center justify-between">
                          <span>
                            URL Slug <span className="text-destructive">*</span>
                          </span>
                          {fieldErrors.slug && (
                            <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              Required
                            </span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => {
                              setIsSlugManuallyEdited(true);
                              setSlug(slugify(e.target.value));
                              if (fieldErrors.slug && e.target.value.trim()) {
                                setFieldErrors((prev) => ({ ...prev, slug: false }));
                              }
                            }}
                            placeholder="first-rizal-monument"
                            className={cn(
                              "font-mono text-xs pl-20",
                              fieldErrors.slug && "border-destructive focus-visible:ring-destructive/40",
                            )}
                          />
                          <span className="pointer-events-none absolute left-3 top-2.5 font-mono text-xs text-muted-foreground">
                            /sites/
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Equal-width columns: Category, Barangay, Year Built */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5 w-full">
                        <Label htmlFor="category" className="text-xs font-medium">
                          Heritage Category
                        </Label>
                        <Select value={category} onValueChange={(val) => setCategory(val as HeritageCategory)}>
                          <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                              <SelectItem key={catKey} value={catKey}>
                                {catLabel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 w-full">
                        <Label htmlFor="barangay" className="text-xs font-medium">
                          Barangay
                        </Label>
                        <Select value={barangay} onValueChange={setBarangay}>
                          <SelectTrigger id="barangay" className="w-full">
                            <SelectValue placeholder="Select Barangay" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {municipality === "Daet" ? (
                              DAET_BARANGAYS.map((b) => (
                                <SelectItem key={b} value={b}>
                                  {b}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value={barangay || "Poblacion"}>{barangay || "Poblacion"}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 w-full">
                        <Label htmlFor="yearBuilt" className="text-xs font-medium">
                          Year Built / Period
                        </Label>
                        <Input
                          id="yearBuilt"
                          value={yearBuilt}
                          onChange={(e) => setYearBuilt(e.target.value)}
                          placeholder="e.g. 1898, 1611, Spanish Era"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Administrative Scalability & Geographic Coordinates */}
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <MapPin className="size-4 text-[#c5a059]" />
                          <span>Administrative Jurisdiction &amp; GPS Coordinates</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-[#c5a059] border-[#c5a059]/30">
                          Camarines Norte
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Municipality Dropdown */}
                        <div className="space-y-1.5 w-full">
                          <Label htmlFor="municipality" className="text-xs font-medium">
                            Municipality
                          </Label>
                          <Select value={municipality} onValueChange={setMunicipality}>
                            <SelectTrigger id="municipality" className="w-full">
                              <SelectValue placeholder="Select Municipality" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                              {CAMARINES_NORTE_MUNICIPALITIES.map((mun) => (
                                <SelectItem key={mun} value={mun}>
                                  {mun}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Province Input */}
                        <div className="space-y-1.5 w-full">
                          <Label htmlFor="province" className="text-xs font-medium">
                            Province
                          </Label>
                          <Input
                            id="province"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="Camarines Norte"
                            className="w-full"
                          />
                        </div>

                        {/* Latitude */}
                        <div className="space-y-1.5 w-full">
                          <Label htmlFor="lat" className="text-xs font-medium text-muted-foreground">
                            Latitude (GPS)
                          </Label>
                          <Input
                            id="lat"
                            type="number"
                            step="any"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="14.1122"
                            className="w-full font-mono text-xs"
                          />
                        </div>

                        {/* Longitude */}
                        <div className="space-y-1.5 w-full">
                          <Label htmlFor="lng" className="text-xs font-medium text-muted-foreground">
                            Longitude (GPS)
                          </Label>
                          <Input
                            id="lng"
                            type="number"
                            step="any"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="122.9553"
                            className="w-full font-mono text-xs"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Configured for province-wide scalability across Camarines Norte municipalities. Currently scoped
                        to Daet barangays.
                      </p>
                    </div>
                  </TabsContent>

                  {/* TAB 2: Historical Narrative (Hybrid Fixed + Flexible Sections) */}
                  <TabsContent value="narrative" className="space-y-6 pt-4 m-0 animate-in fade-in-50 duration-200">
                    {/* Universal Fixed Sections */}
                    <div className="space-y-4">
                      {/* 1. Overview (Universal Summary Field - Required) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="overview"
                            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                          >
                            <span>Overview</span>
                            <span className="text-destructive">*</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono text-[#c5a059] border-[#c5a059]/30"
                            >
                              Universal Summary
                            </Badge>
                          </Label>
                          {fieldErrors.overview ? (
                            <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              Required
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Displayed on directory cards and exhibition summary
                            </span>
                          )}
                        </div>
                        <Textarea
                          id="overview"
                          value={shortDescription}
                          onChange={(e) => {
                            setShortDescription(e.target.value);
                            if (fieldErrors.overview && e.target.value.trim()) {
                              setFieldErrors((prev) => ({ ...prev, overview: false }));
                            }
                          }}
                          rows={3}
                          placeholder="A concise curatorial overview summarizing the site's historical prominence and identity..."
                          className={cn(
                            "w-full text-sm leading-relaxed",
                            fieldErrors.overview && "border-destructive focus-visible:ring-destructive/40",
                          )}
                        />
                      </div>

                      {/* 2. History (Universal Chronicle Field - Required) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="history"
                            className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                          >
                            <span>History</span>
                            <span className="text-destructive">*</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono text-[#c5a059] border-[#c5a059]/30"
                            >
                              Universal Chronicle
                            </Badge>
                          </Label>
                          {fieldErrors.history ? (
                            <span className="text-[10px] font-medium text-destructive flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              Required
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              Comprehensive historical chronicle and archival records
                            </span>
                          )}
                        </div>
                        <Textarea
                          id="history"
                          value={historicalContext}
                          onChange={(e) => {
                            setHistoricalContext(e.target.value);
                            if (fieldErrors.history && e.target.value.trim()) {
                              setFieldErrors((prev) => ({ ...prev, history: false }));
                            }
                          }}
                          rows={6}
                          placeholder="Detailed chronicle of construction, founding dates, Franciscan missionaries, Katipunan revolutionaries, or civic annals..."
                          className={cn(
                            "w-full text-sm leading-relaxed",
                            fieldErrors.history && "border-destructive focus-visible:ring-destructive/40",
                          )}
                        />
                      </div>
                    </div>

                    {/* Repeatable Additional Details & Custom Sections */}
                    <div className="rounded-lg border border-[#c5a059]/30 bg-card/40 p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-3">
                        <div>
                          <div className="flex items-center gap-2 text-[#c5a059]">
                            <Layers className="size-4.5" />
                            <Label className="text-sm font-semibold text-foreground">
                              Additional Details &amp; Custom Sections ({additionalSections.length})
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Add flexible, repeatable chapters tailored for this site (e.g., Architecture, Current Use,
                            Key Figures, Cultural Significance).
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddSection}
                          className="h-8 gap-1.5 border-[#c5a059]/50 text-xs font-medium text-[#e5c98b] hover:bg-[#c5a059]/15 shrink-0"
                        >
                          <Plus className="size-3.5" />
                          <span>Add Section</span>
                        </Button>
                      </div>

                      {/* Section Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="size-3 text-[#c5a059]" />
                          Quick ideas:
                        </span>
                        {[
                          "Cultural Significance",
                          "Architecture",
                          "Current Use",
                          "Key Figures",
                          "Religious Feasts",
                          "Restoration History",
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setAdditionalSections((prev) => [
                                ...prev,
                                {
                                  id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                  label: suggestion,
                                  content: "",
                                },
                              ]);
                            }}
                            className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-[#c5a059]/60 hover:bg-[#c5a059]/10 hover:text-[#e5c98b]"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Sections List */}
                      {additionalSections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 py-8 text-center px-4">
                          <Layers className="size-8 text-muted-foreground/40 mb-2" strokeWidth={1.25} />
                          <p className="text-xs font-medium text-foreground">No additional sections added</p>
                          <p className="text-[11px] text-muted-foreground max-w-sm mt-1">
                            This site will display the universal Overview and History. Click &quot;Add Section&quot;
                            above if you wish to document architecture, key historical figures, or cultural notes.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={handleAddSection}
                            className="mt-3 gap-1.5 border-[#c5a059]/40 text-xs text-[#e5c98b]"
                          >
                            <Plus className="size-3" />
                            <span>Add Custom Section</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {additionalSections.map((sec, idx) => (
                            <div
                              key={sec.id}
                              className="rounded-lg border border-border/70 bg-card p-4 space-y-3 transition-colors hover:border-border"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2 flex-1">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono shrink-0 border-border text-muted-foreground"
                                  >
                                    Section #{idx + 1}
                                  </Badge>
                                  <div className="relative flex-1 max-w-md">
                                    <Input
                                      value={sec.label}
                                      onChange={(e) => handleUpdateSection(idx, "label", e.target.value)}
                                      placeholder="Section Title (e.g., Architecture, Cultural Significance, Key Figures)"
                                      className="h-8 text-xs font-medium"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleMoveSection(idx, "up")}
                                    disabled={idx === 0}
                                    title="Move section up"
                                    className="h-7 w-7"
                                  >
                                    <ArrowUp className="size-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleMoveSection(idx, "down")}
                                    disabled={idx === additionalSections.length - 1}
                                    title="Move section down"
                                    className="h-7 w-7"
                                  >
                                    <ArrowDown className="size-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => handleRemoveSection(idx)}
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    title="Delete section"
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Textarea
                                  value={sec.content}
                                  onChange={(e) => handleUpdateSection(idx, "content", e.target.value)}
                                  rows={4}
                                  placeholder={`Write narrative content for ${sec.label || "this section"}...`}
                                  className="w-full text-xs sm:text-sm leading-relaxed"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 3: Media & 360 View */}
                  <TabsContent value="media" className="space-y-5 pt-4 m-0 animate-in fade-in-50 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3.5 py-2.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Info className="size-4 text-[#c5a059] shrink-0" />
                        <span>
                          <strong>Media is strictly optional:</strong> You can create or save this record now and upload
                          photos/panoramas later once student field assets arrive.
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono text-muted-foreground shrink-0 border-border/80 self-start sm:self-auto"
                      >
                        Optional Tab
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Cover Photo: Upload-only */}
                      <div className="rounded-lg border border-border/60 p-4 flex flex-col justify-between">
                        <div>
                          <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Camera className="size-4 text-[#c5a059]" />
                              <Label className="text-xs font-semibold">Site Cover Photo</Label>
                            </div>
                            {coverImageUrl ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              >
                                Photo Attached
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/80">
                                Optional (No Photo)
                              </Badge>
                            )}
                          </div>

                          <p className="text-[11px] text-muted-foreground mb-3">
                            Upload an official cover photo directly to Supabase Storage. (Manual URL pasting is disabled
                            to prevent broken external links).
                          </p>

                          <div className="flex items-center gap-2.5">
                            <Label
                              htmlFor="cover-file-upload"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#c5a059] px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#b08e48] transition-colors"
                            >
                              <UploadCloud className="size-4" />
                              <span>
                                {isUploadingCover
                                  ? "Uploading to Storage..."
                                  : coverImageUrl
                                    ? "Change Cover Photo"
                                    : "Upload Cover Photo"}
                              </span>
                            </Label>
                            <input
                              id="cover-file-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,image/*"
                              className="hidden"
                              onChange={handleCoverUpload}
                              disabled={isUploadingCover}
                            />
                            {coverImageUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCoverImageUrl("")}
                                className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 h-8"
                              >
                                <X className="size-3.5 mr-1" />
                                <span>Remove</span>
                              </Button>
                            )}
                            {isUploadingCover && <Loader2 className="size-4 animate-spin text-[#c5a059]" />}
                          </div>
                        </div>

                        <div className="mt-4 relative aspect-video overflow-hidden rounded-md border border-border/80 bg-black/40 flex items-center justify-center max-h-48">
                          {coverImageUrl ? (
                            <img src={coverImageUrl} alt="Cover preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <Camera className="size-8 text-muted-foreground/40 mb-1" strokeWidth={1.25} />
                              <span className="text-xs text-muted-foreground">No cover image uploaded</span>
                              <span className="text-[10px] text-muted-foreground/75 mt-0.5">
                                Click &quot;Upload Cover Photo&quot; to select an image file
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Supplementary Gallery Photos (Bulk Multiple Upload) */}
                      <div className="rounded-lg border border-border/60 p-4 flex flex-col justify-between">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="size-4 text-muted-foreground" />
                              <Label className="text-xs font-semibold">Supplementary Gallery Photos</Label>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                              {galleryImages.length} attached
                            </Badge>
                          </div>

                          <p className="text-[11px] text-muted-foreground mb-3">
                            Upload multiple photos simultaneously. Immediate thumbnail previews are displayed upon
                            upload.
                          </p>

                          <div className="flex items-center gap-2.5">
                            <Label
                              htmlFor="gallery-file-upload"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#c5a059]/50 bg-[#c5a059]/10 px-3.5 py-2 text-xs font-semibold text-[#e5c98b] hover:bg-[#c5a059]/20 transition-colors"
                            >
                              <UploadCloud className="size-4" />
                              <span>
                                {isUploadingGallery
                                  ? "Uploading Gallery Files..."
                                  : "Upload Gallery Photos (Select Multiple)"}
                              </span>
                            </Label>
                            <input
                              id="gallery-file-upload"
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,image/*"
                              className="hidden"
                              onChange={handleGalleryUpload}
                              disabled={isUploadingGallery}
                            />
                            {isUploadingGallery && <Loader2 className="size-4 animate-spin text-[#c5a059]" />}
                          </div>
                        </div>

                        <div className="mt-4">
                          {galleryImages.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 border border-border/60 rounded-md bg-muted/10">
                              {galleryImages.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  className="group relative aspect-square overflow-hidden rounded border border-border bg-black"
                                >
                                  <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 rounded-full bg-black/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                                    title="Remove photo"
                                  >
                                    <X className="size-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border/80 rounded-md text-center p-4">
                              <ImageIcon className="size-8 text-muted-foreground/40 mb-1" strokeWidth={1.25} />
                              <span className="text-xs text-muted-foreground">No gallery images uploaded</span>
                              <span className="text-[10px] text-muted-foreground/75 mt-0.5">
                                Select one or multiple photos to showcase gallery angles
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 360° Equirectangular Perspectives (Multiple Panoramas) */}
                    <div className="rounded-lg border border-[#c5a059]/40 bg-card/60 p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c5a059]/20 pb-3">
                        <div>
                          <div className="flex items-center gap-2 text-[#c5a059]">
                            <Eye className="size-4.5" />
                            <Label className="text-sm font-semibold text-foreground">
                              360° Equirectangular Perspectives ({panoramas.length})
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Support multiple panoramic viewpoints (e.g. Exterior Facade, Interior Altar, Plaza, Bell
                            Tower). Recommended: 2:1 equirectangular up to 8192×4096 (8K Ultra HD).
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick Add Perspective Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddPanorama}
                            className="h-8 gap-1.5 border-[#c5a059]/50 text-xs font-medium text-[#e5c98b] hover:bg-[#c5a059]/15"
                          >
                            <Plus className="size-3.5" />
                            <span>Add View Angle</span>
                          </Button>

                          {/* Direct File Upload (appends new perspective) */}
                          <Label
                            htmlFor="new-pano-file-upload"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#c5a059] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#b08e48] transition-colors"
                          >
                            <UploadCloud className="size-3.5" />
                            <span>{isUploadingNewPano ? "Uploading..." : "Upload 360 File"}</span>
                          </Label>
                          <input
                            id="new-pano-file-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                            className="hidden"
                            onChange={(e) => handleUploadPanoramaFile(e)}
                            disabled={isUploadingNewPano}
                          />
                          {isUploadingNewPano && <Loader2 className="size-4 animate-spin text-[#c5a059]" />}
                        </div>
                      </div>

                      {/* List of Panorama Cards */}
                      {panoramas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border/80 bg-muted/20 py-8 text-center px-4">
                          <Eye className="size-8 text-muted-foreground/50 mb-2" strokeWidth={1.25} />
                          <p className="text-xs font-medium text-foreground">No 360° perspectives uploaded yet</p>
                          <p className="text-[11px] text-muted-foreground max-w-sm mt-1">
                            Add multiple panoramic views so visitors can explore both exterior facades and interior
                            chambers.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={handleAddPanorama}
                            className="mt-3 gap-1.5 border-[#c5a059]/40 text-xs text-[#e5c98b]"
                          >
                            <Plus className="size-3" />
                            <span>Add First Perspective</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {panoramas.map((pano, idx) => {
                            const isTheaterSelected = selectedTheaterIndex === idx;
                            const isThisUploading = uploadingPanoIndex === idx;

                            return (
                              <div
                                key={pano.id ?? idx}
                                className={`rounded-lg border p-3 transition-all ${
                                  isTheaterSelected
                                    ? "border-[#c5a059] bg-[#c5a059]/5 shadow-xs"
                                    : "border-border/60 bg-muted/10 hover:border-border"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] font-mono shrink-0 ${
                                        idx === 0
                                          ? "border-[#c5a059]/60 bg-[#c5a059]/15 text-[#e5c98b]"
                                          : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {idx === 0 ? "Primary (Main)" : `#${idx + 1}`}
                                    </Badge>

                                    <Input
                                      value={pano.label}
                                      onChange={(e) => handleUpdatePanorama(idx, "label", e.target.value)}
                                      placeholder="Perspective label (e.g. Exterior Facade, Altar, Belfry)"
                                      className="h-7 text-xs font-medium max-w-xs"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    {/* Select in Theater button */}
                                    <Button
                                      type="button"
                                      variant={isTheaterSelected ? "default" : "ghost"}
                                      size="xs"
                                      onClick={() => setSelectedTheaterIndex(idx)}
                                      className={`h-7 px-2.5 text-[11px] gap-1 ${
                                        isTheaterSelected
                                          ? "bg-[#c5a059] text-black font-semibold hover:bg-[#b08e48]"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      <Eye className="size-3" />
                                      <span>{isTheaterSelected ? "Viewing" : "Preview"}</span>
                                    </Button>

                                    {/* Move Up */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleMovePanorama(idx, "up")}
                                      disabled={idx === 0}
                                      title="Move up in display order"
                                      className="h-7 w-7"
                                    >
                                      <ArrowUp className="size-3" />
                                    </Button>

                                    {/* Move Down */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleMovePanorama(idx, "down")}
                                      disabled={idx === panoramas.length - 1}
                                      title="Move down in display order"
                                      className="h-7 w-7"
                                    >
                                      <ArrowDown className="size-3" />
                                    </Button>

                                    {/* Delete */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleRemovePanorama(idx)}
                                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                      title="Remove this perspective"
                                    >
                                      <Trash2 className="size-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* URL and File Upload row */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <div className="relative flex-1">
                                    <Input
                                      value={pano.panorama_url}
                                      onChange={(e) => handleUpdatePanorama(idx, "panorama_url", e.target.value)}
                                      placeholder="Paste equirectangular image URL or upload image file"
                                      className="h-8 text-xs font-mono pr-8"
                                    />
                                    {pano.panorama_url && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePanorama(idx, "panorama_url", "")}
                                        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Label
                                      htmlFor={`pano-file-${idx}`}
                                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded border border-dashed border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1.5 text-xs font-medium text-[#e5c98b] hover:bg-[#c5a059]/20"
                                    >
                                      <UploadCloud className="size-3.5" />
                                      <span>{isThisUploading ? "Uploading..." : "Upload File"}</span>
                                    </Label>
                                    <input
                                      id={`pano-file-${idx}`}
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                                      className="hidden"
                                      onChange={(e) => handleUploadPanoramaFile(e, idx)}
                                      disabled={isThisUploading}
                                    />
                                    {isThisUploading && <Loader2 className="size-3.5 animate-spin text-[#c5a059]" />}

                                    {pano.panorama_url ? (
                                      <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] h-6">
                                        Ready
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] text-amber-500 border-amber-500/30 h-6"
                                      >
                                        Needs Photo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Embedded Live 360 Inspection Theater */}
                      {panoramas.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/40">
                          <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[#c5a059]">
                              <Eye className="size-4" />
                              <span className="text-xs font-semibold text-foreground">
                                Live 360° Inspection Theater:
                              </span>
                              <span className="font-mono text-xs text-[#c5a059]">
                                {panoramas[selectedTheaterIndex]?.label || `Perspective ${selectedTheaterIndex + 1}`}
                              </span>
                            </div>

                            {/* Perspective Switcher Pills */}
                            {panoramas.length > 1 && (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[10px] font-mono text-muted-foreground mr-1">Switch:</span>
                                {panoramas.map((p, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => setSelectedTheaterIndex(pIdx)}
                                    className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                                      selectedTheaterIndex === pIdx
                                        ? "bg-[#c5a059] text-black font-semibold"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {p.label || `#${pIdx + 1}`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="relative aspect-[21/9] sm:aspect-[2.2/1] w-full overflow-hidden border border-[#c5a059]/30 bg-black min-h-[320px]">
                            <PanoramaViewer
                              key={panoramas[selectedTheaterIndex]?.panorama_url || `theater-${selectedTheaterIndex}`}
                              panoramaUrl={panoramas[selectedTheaterIndex]?.panorama_url || null}
                              siteTitle={`${title || "Landmark"} - ${panoramas[selectedTheaterIndex]?.label || "Perspective"}`}
                              className="h-full w-full min-h-[320px]"
                              autoRotate={false}
                            />
                          </div>

                          <p className="mt-1.5 text-right font-mono text-[10px] text-muted-foreground">
                            Drag and pan inside the viewer to inspect equirectangular stitch quality and sphere
                            projection.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>

            <DialogFooter className="mt-6 border-t border-border/60 pt-4 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Status Publication Toggle Pill */}
              <div className="flex items-center">
                <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/40 px-3.5 py-2 transition-colors hover:bg-muted/60">
                  <Switch
                    id="site-publish-toggle"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    aria-label="Toggle site publication"
                    suppressHydrationWarning={true}
                  />
                  <Label
                    htmlFor="site-publish-toggle"
                    className="cursor-pointer text-xs flex items-center gap-2 select-none"
                  >
                    <span className="text-muted-foreground">Publication Status:</span>
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        Published (Live)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                        <span className="size-2 rounded-full bg-muted-foreground/50" />
                        Draft (Unpublished)
                      </span>
                    )}
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="gap-2 bg-[#c5a059] text-black hover:bg-[#b08e4c] font-medium text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" />
                      <span>{isEditing ? "Update Heritage Site" : "Create Heritage Site"}</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safety Confirmation Dialog for Publishing without Media */}
      <AlertDialog open={showNoMediaConfirmDialog} onOpenChange={setShowNoMediaConfirmDialog}>
        <AlertDialogContent className="border-[#c5a059]/40 bg-card max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <AlertTriangle className="size-5 shrink-0" />
              <AlertDialogTitle className="text-base font-semibold text-foreground">
                No Cover Photo or 360° View Attached
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This heritage site is currently set to <strong className="text-emerald-400">Published (Live)</strong>, but
              has no cover photo and no 360° panorama perspectives attached yet.
              <br />
              <br />
              It will appear without visual assets to public visitors. Would you like to publish it anyway, or save it
              as a Draft while awaiting media files?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNoMediaConfirmDialog(false);
                setActiveTab("media");
              }}
              className="text-xs"
            >
              Back to Media Tab
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNoMediaConfirmDialog(false);
                setIsPublished(false);
                executeSaveSite(false);
              }}
              className="text-xs border-border text-muted-foreground hover:text-foreground"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setShowNoMediaConfirmDialog(false);
                executeSaveSite(true);
              }}
              className="text-xs bg-[#c5a059] text-black hover:bg-[#b08e48] font-semibold"
            >
              Publish Anyway
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
