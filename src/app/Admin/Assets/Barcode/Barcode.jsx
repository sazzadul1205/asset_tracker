// Barcode generator
import Barcode from "react-barcode";

const BarcodeGenerator = ({ number }) => {
  return (
    <div className="flex flex-col items-center p-2">
      {/* Barcode at the top */}
      <Barcode
        value={number}                 // The actual number for barcode
        displayValue={false}           // hide the number inside the barcode
        lineColor="#000"
        width={1}
        height={20}
        margin={0}
      />

      {/* Number displayed below */}
      <p className="mt-2 font-mono text-sm text-center">{number}</p>
    </div>
  );
};

export default BarcodeGenerator;
