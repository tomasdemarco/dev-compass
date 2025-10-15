"use client"
import React from "react";
import { useAppSelector } from "@/store";
import { SuccessIcon, WarningIcon, ErrorIcon } from "@/components/generics/Icons"

import {AlertType} from "@/types";

const Alert = () => {
    const alertReducer = useAppSelector(state => state.alertSlice);

    return (
        <div className={`${!alertReducer.visible ? "-bottom-full" : "bottom-3"} end-3 fixed z-50 transition-all duration-500`}>
            <div className={`min-h-12 w-96 rounded-md flex justify-center items-center text-white
            ${alertReducer.type === AlertType.Success ? "bg-success"
                    : alertReducer.type === AlertType.Error ? "bg-error"
                        : "bg-warning"}
            `}>
                {alertReducer.type === AlertType.Success ? <SuccessIcon className="flex-shrink h-7 w-7 mx-3" />
                    : alertReducer.type === AlertType.Error ? <ErrorIcon className="flex-shrink h-7 w-7 mx-3" />
                        : <WarningIcon className="flex-shrink h-7 w-7 mx-3" />
                }
                <p className="flex-1 m-2 overflow-hidden text-ellipsis">
                    {alertReducer.text}
                </p>
            </div>
        </div>
    );
};

export default Alert;
