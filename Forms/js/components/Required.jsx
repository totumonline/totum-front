import React from 'react';


export const Required = ({field})=>{
   if(field.required){
      return <span className="ttm-field-required">*</span>;
   }
   return '';
}