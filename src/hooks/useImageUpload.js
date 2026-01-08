import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

export const useImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const uploadImage = useCallback(async (fileOrUrl) => {
    if (!fileOrUrl) return null;

    // Return if already a usable URL
    if (typeof fileOrUrl === "string") {
      if (/^(https?:\/\/|data:)/i.test(fileOrUrl)) {
        return fileOrUrl;
      }
    }

    const API_KEY = process.env.NEXT_PUBLIC_IMAGE_HOSTING_KEY;
    if (!API_KEY) {
      setError("Image hosting key is missing");
      return null;
    }

    const API_URL = `https://api.imgbb.com/1/upload?key=${API_KEY}`;

    setLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("image", fileOrUrl);

      const { data } = await axios.post(API_URL, formData, {
        signal: abortRef.current.signal,
      });

      return data?.data?.display_url ?? null;
    } catch (err) {
      if (axios.isCancel(err)) return null;

      setError(
        err?.response?.data?.error?.message ||
          err?.message ||
          "Image upload failed"
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return { uploadImage, loading, error };
};
