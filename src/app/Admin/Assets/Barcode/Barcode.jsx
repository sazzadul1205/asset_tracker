// Barcode generator
import Barcode from "react-barcode";

const BarcodeGenerator = ({
  number,
  showNumber = true,
  barWidth = 1,     // default width
  barHeight = 20,   // default height
  numberBellow = 2,
  numberText = "sm",
  padding = 2,
}) => {
  return (
    <div className={`flex flex-col items-center p-${padding}`}>
      {/* Barcode */}
      <Barcode
        value={number}
        displayValue={false}
        lineColor="#000"
        width={barWidth}
        height={barHeight}
        margin={0}
      />

      {/* Number below */}
      {showNumber && (
        <p className={`mt-${numberBellow} font-mono text-${numberText} text-center`}>{number}</p>
      )}
    </div>
  );
};

export default BarcodeGenerator;
