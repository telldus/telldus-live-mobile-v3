
import React from 'react';
import reducer from "../../Reducers/App.js";
import * as types from "../../Actions/Types";


describe('App reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(
      {
      	errorGlobalMessage: 'Action Currently Unavailable',
      	errorGlobalShow: false,
        active:false
      }
    )
  })

  it('should handle global error show', () => {
    expect(
      reducer(
        {
          errorGlobalShow:false,
          active:false,
          errorGlobalMessage: 'Global error hide'
        },
        {
        type: types.GLOBAL_ERROR_HIDE,
        errorGlobalShow: true,
        active:true
      })
    ).toEqual(
      {
        errorGlobalShow: false,
        active:false,
        errorGlobalMessage: 'Global error hide'
      },
      {
        errorGlobalShow: false,
        active:true,
        errorGlobalMessage: 'Global error hide'
      }
    )


})

it('should handle global error hide', () => {
   expect(
     reducer(
       {
         errorGlobalShow:true,
           active:true,
         errorGlobalMessage: 'Global error show'
       },
       {
       type: types.GLOBAL_ERROR_SHOW,
         active:true,
       errorGlobalShow: false
     })
   ).toEqual(
     {
       errorGlobalShow: true,
         active:true,
       errorGlobalMessage: 'Global error show'
     },
     {
       errorGlobalShow: true,
         active:true,
       errorGlobalMessage: 'Global error show'
     }
   )

})

})
