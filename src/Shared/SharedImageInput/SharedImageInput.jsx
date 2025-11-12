
// React Components
import {
  useId,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle
} from "react";

// Next Components
import Image from "next/image";
import Cropper from "react-easy-crop";

// Icons
import { FaUpload } from "react-icons/fa";

// Utils
import { getCroppedImgCircular } from "../../Utils/getCroppedImgCircular";

const SharedImageInput = forwardRef(({
  onChange,
  width = 256,
  height = 256,
  IconSize = 32,
  clear = false,
  maxSizeMB = 32,
  rounded = "full",
  enableCrop = true,
  defaultImage = null,
  label = "Profile Image",
  hint = "Drag & drop or click to upload"
}, ref) => {
  // modal
  const modalId = useId();

  // crop state
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // image state
  const [imageSrc, setImageSrc] = useState(null);

  // display image
  const displayImage = imageSrc || defaultImage;

  // clear state when requested
  useEffect(() => {
    if (clear) {
      const timer = setTimeout(() => {
        setImageSrc(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [clear]);

  // auto-clear error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // crop handlers
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // image handlers
  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!acceptedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, or WEBP allowed.");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Max file size is ${maxSizeMB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const imgData = reader.result;
        setError("");

        if (enableCrop) {
          setImageSrc(imgData);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
          setCroppedAreaPixels(null);
          document.getElementById(modalId)?.showModal();
        } else {
          setImageSrc(imgData);
          const blob = await fetch(imgData).then((res) => res.blob());
          onChange?.(new File([blob], file.name, { type: file.type }));
        }
      };
      reader.readAsDataURL(file);
    },
    [enableCrop, maxSizeMB, modalId, onChange]
  );

  // crop handlers
  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedFile = await getCroppedImgCircular(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedFile);
      setImageSrc(previewUrl);
      onChange?.(croppedFile);
      document.getElementById(modalId)?.close();
    } catch {
      setError("Failed to crop image.");
    }
  }, [imageSrc, croppedAreaPixels, modalId, onChange]);

  // expose methods to parent
  useImperativeHandle(ref, () => ({
    clear: () => {
      setImageSrc(null);
      onChange?.(null); // notify parent
    },
    resetToDefault: () => {
      setImageSrc(null); // displayImage will fallback to default
      onChange?.(null);  // notify parent
    },
  }));

  return (
    <div className="w-full max-w-sm mx-auto space-y-2">
      {label && <label className="block text-gray-700 text-center font-semibold">{label}</label>}

      <div
        className={`relative flex items-center justify-center border-2 border-dashed border-gray-400 hover:border-blue-500 cursor-pointer overflow-hidden mx-auto group rounded-${rounded} transition-all`}
        style={{ width, height }}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => { if (enableCrop && imageSrc) document.getElementById(modalId)?.showModal(); }}
        role="button"
        aria-label={label}
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt="Selected preview"
            width={width}
            height={height}
            className={`object-cover rounded-${rounded}`}
            style={{ width: "100%", height: "100%" }}
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 transition-all duration-200">
            <FaUpload size={IconSize} className="text-gray-400 group-hover:text-blue-500" />
            <span className="text-center group-hover:text-blue-500 text-sm mt-1">{hint}</span>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}

      {enableCrop && (
        <dialog id={modalId} className="modal">
          <div className="modal-box flex flex-col items-center gap-4 bg-white text-black rounded-xl">
            <h3 className="font-bold text-lg text-center">Crop Your Image</h3>

            {imageSrc && (
              <div className={`relative bg-gray-200 overflow-hidden rounded-${rounded}`} style={{ width: 256, height: 256 }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 w-full">
              <label className="text-gray-700 text-sm">Zoom:</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-32 accent-blue-600"
              />
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
              >
                Confirm
              </button>

              <button
                type="button"
                onClick={() => document.getElementById(modalId)?.close()}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
});


SharedImageInput.displayName = "SharedImageInput";

export default SharedImageInput;
