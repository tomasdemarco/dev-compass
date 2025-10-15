import React from "react"

interface LoadingProps {
    size?: number;
}

const Loading: React.FC<LoadingProps> = ({ size = 70 }) => {
    return (
        <div className="w-full h-full fixed top-0 left-0 bg-black opacity-80 z-50">
            <div className="flex justify-center items-center mt-[40vh]">
                <div style={{ width: `${size}px`, height: `${size}px` }} className="animate-spin">
                    <div className="h-full w-full text-gray border-8 border-t-primary-gp border-b-secondary-gp rounded-[50%]" />
                </div>
            </div>
        </div>
    );
}
export default Loading;
