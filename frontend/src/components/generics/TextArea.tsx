// "use client"
// import React from "react"
// import useWindowDimensions from '../../../hooks/useWindowDimensions';
//
// // @ts-ignore
// const TextArea = ({error, rows, cols, ...props}) => {
//     const {width, height} = useWindowDimensions();
//
//     return (
//         <>
//             <textarea
//                 className="overflow-auto w-full resize-none p-2 bg-white/5 block rounded-md border-0 py-1.5 shadow-sm shadow-secondary-gp/25 ring-1 ring-inset ring-gray/25 placeholder:text-gray focus:ring-2 focus:ring-inset focus:ring-primary-gp"
//                 rows={rows !== null ? rows : height/50}
//                 cols={cols !== null ? cols : width/25}
//                 {...props}
//             />
//             {error !== undefined && error !== "" ?
//                 <label
//                     className={`text-xs text-error p-1`}>
//                     {error}
//                 </label>
//                 : null}
//         </>
//     );
// };
//
//
// export {TextArea};