interface InputProps {
  type: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  value: string | number,
  placeholder?: string,
  length?: number
}

const InputStyles = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 transition shadow-sm";

const Input = ({type,value,onChange,placeholder,length}: InputProps) => {
  return (
    <input
      type={type}
      required
      placeholder={placeholder}
      className={placeholder ? `${InputStyles} font-bold tracking-widest text-center text-lg`: InputStyles}
      value={value}
      onChange={onChange}
      maxLength={length}
    />
  );
};

export default Input;
