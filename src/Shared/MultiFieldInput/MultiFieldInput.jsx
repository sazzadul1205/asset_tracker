// React Components
import React, { useCallback, useEffect } from "react";

// React Hook Form
import { useFieldArray } from "react-hook-form";

// Icons
import { FaPlus, FaTrash } from "react-icons/fa";

// Shared
import SharedInput from "@/Shared/SharedInput/SharedInput";

/**
 * MultiFieldInput
 * Dynamic rows of inputs (text, number, select, etc.)
 * 
 * Props:
 * - register: react-hook-form register
 * - control: react-hook-form control
 * - errors: react-hook-form errors
 * - fieldName: string (field array name)
 * - title: string (section title)
 * - showIndex: boolean (show row index)
 * - fieldsConfig: array of objects defining each input per row
 * - minRows: number (minimum number of rows)
 */
const MultiFieldInput = ({
  register,
  control,
  errors,
  fieldName = "items",
  title = "Items / Details",
  showIndex = true,
  minRows = 1,
  fieldsConfig = [
    {
      type: "text",
      name: "description",
      label: "Description",
      placeholder: "Item description",
      widthClass: "flex-1 min-w-[150px]",
    },
    {
      name: "price",
      type: "number",
      label: "Price (USD)",
      placeholder: "Price",
      widthClass: "w-32",
    },
  ],
}) => {
  const { fields, append, remove } = useFieldArray({ control, name: fieldName });

  // Generate default row
  const generateDefaultRow = useCallback(() => {
    const row = {};
    fieldsConfig.forEach(f => (row[f.name] = f.defaultValue || ""));
    return row;
  }, [fieldsConfig]);

  // Ensure minimum rows exist
  useEffect(() => {
    if (fields.length < minRows) {
      const rowsToAdd = minRows - fields.length;
      for (let i = 0; i < rowsToAdd; i++) append(generateDefaultRow());
    }
  }, [fields, append, minRows, generateDefaultRow]);

  const handleRemove = (index) => {
    remove(index);
    // Ensure minimum rows after removal
    if (fields.length - 1 < minRows) {
      append(generateDefaultRow());
    }
  };

  return (
    <div className="space-y-3">
      <label className="font-semibold text-gray-700 block mb-2">{title}</label>
      <div className="w-full h-px bg-gray-300 mb-2" />

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap items-end gap-3">
          {/* Row Index */}
          {showIndex && (
            <div className="flex items-center justify-center w-6 text-gray-600 font-medium pb-2">
              {index + 1}.
            </div>
          )}

          {/* Inputs */}
          {fieldsConfig.map((f, idx) => (
            <div key={idx} className={f.widthClass || "flex-1 min-w-[150px]"}>
              <SharedInput
                label={f.label}
                name={`${fieldName}.${index}.${f.name}`}
                type={f.type || "text"}
                placeholder={f.placeholder || ""}
                register={register}
                rules={f.rules || undefined}
                options={f.options || undefined} // for select inputs
                error={errors?.[fieldName]?.[index]?.[f.name]}
              />
            </div>
          ))}

          {/* Delete Button */}
          <div className="flex items-end mt-6">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={fields.length <= minRows}
              className={`flex items-center gap-1 px-3 py-3 text-red-600 border border-red-600 rounded-lg text-sm font-semibold transition-all ${fields.length <= minRows
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-red-600 hover:text-white"
                }`}
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div className="w-full h-px bg-gray-300 my-2" />

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => append(generateDefaultRow())}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
        >
          <FaPlus /> Add Item
        </button>
      </div>
    </div>
  );
};

export default MultiFieldInput;
