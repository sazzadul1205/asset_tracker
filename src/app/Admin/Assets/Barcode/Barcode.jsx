// React Components
import Barcode from "react-barcode";

// Tanstack
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

/**
 * BarcodeGenerator Component
 *
 * @param {object} props
 * @param {string} [props.number]  
 *        Direct barcode text. Used when `assetId` is not provided.
 *
 * @param {string} [props.assetId]  
 *        If provided, the component will fetch asset details and use the asset_tag automatically.
 *
 * @param {boolean} [props.showNumber=true]  
 *        Whether to show the barcode number below the barcode.
 *
 * @param {number} [props.barWidth=1]  
 *        Width of individual barcode bars.
 *
 * @param {number} [props.barHeight=20]  
 *        Height of the barcode.
 *
 * @param {number} [props.numberBellow=2]  
 *        Margin spacing below barcode before number.
 *
 * @param {string} [props.numberText="sm"]  
 *        Text size for the number below (e.g., "sm", "md", "lg").
 *
 * @param {number} [props.padding=2]  
 *        Padding around the barcode container.
 */
const BarcodeGenerator = ({
  number,
  assetId,
  padding = 2,
  barWidth = 1,
  barHeight = 20,
  numberBellow = 2,
  numberText = "sm",
  showNumber = true,
}) => {
  const axiosPublic = useAxiosPublic();

  const { data: AssetData, isLoading, isError, error } = useQuery({
    queryKey: ["BarcodeAsset", assetId],
    queryFn: () =>
      axiosPublic.get(`/Assets/${assetId}`).then((res) => res.data.data),
    enabled: !!assetId,
  });

  const barcodeNumber =
    assetId && AssetData
      ? (
        AssetData.asset_tag ||
        AssetData.asset?.value ||
        AssetData.general?.current_asset?.value
      )
      : number;

  return (
    <div className={`flex flex-col items-center p-${padding}`}>
      {assetId && isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : assetId && isError ? (
        <p className="text-red-500">
          Error: {error?.message || "Failed to load"}
        </p>
      ) : barcodeNumber ? (
        <>
          <Barcode
            value={barcodeNumber}
            displayValue={false}
            lineColor="#000"
            width={barWidth}
            height={barHeight}
            margin={0}
          />

          {showNumber && (
            <p className={`mt-${numberBellow} font-mono text-${numberText} text-center`}>
              {barcodeNumber}
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-400">No data</p>
      )}
    </div>
  );
};

export default BarcodeGenerator;
