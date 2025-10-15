import React from "react";

interface ItemIndexProps {
    text: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const ItemIndex: React.FC<ItemIndexProps> = ({ text, icon, onClick }) => {
  return (
    <>
      <div
        className="flex text-md rounded-lg hover:bg-primary-gp/25 cursor-pointer py-1 items-center mx-1"
        onClick={onClick}
      >
        <div className="pl-2">
          {icon}
        </div>
        <div className="pl-2">
          {text}
        </div>
      </div>
    </>
  );
};
export default ItemIndex;
