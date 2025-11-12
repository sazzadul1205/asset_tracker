// React Components
import { useState } from "react";
import axios from "axios";

export const useImageUpload = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async (fileOrUrl) => {
    if (!fileOrUrl) return null;

    // If it's already a URL, return it directly
    if (
      typeof fileOrUrl === "string" &&
      (fileOrUrl.startsWith("http") || fileOrUrl.startsWith("data:"))
    ) {
      return fileOrUrl;
    }

    // Else, upload as a File
    const Image_Hosting_Key = process.env.NEXT_PUBLIC_IMAGE_HOSTING_KEY;
    const Image_Hosting_API = `https://api.imgbb.com/1/upload?key=${Image_Hosting_Key}`;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", fileOrUrl);

      const res = await axios.post(Image_Hosting_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data?.data?.display_url || null;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
};
