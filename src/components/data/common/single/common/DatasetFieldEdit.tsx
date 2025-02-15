import { Button } from "react-bootstrap";
import { PencilFill } from 'react-bootstrap-icons';
import React, { ReactNode, useState, useEffect } from "react";
import { useKeycloak } from '@react-keycloak/web';

import BodyPid from "./fieldedit/BodyPid";
import BodyId from "./fieldedit/BodyId";
import BodyLicense from "./fieldedit/BodyLicense";
import DialogSize from "../../../../../model/DialogSize";
import { usePatchSingleDataMutation } from "../../../../../service/singledata-api";
import SingleDataType from "../../../../../model/SingleDataType";
import StaticValues from "../../../../../api/StaticValues";
import Dialog from "../../../../common/Dialog";
import Message from "../../../../../model/Message";
import Util from "../../../../../Util";
import SingleDataFactory from "../../../../../api/SingleDataFactory";
import BodyEnumSelect from "./fieldedit/BodyEnumSelect";
import SingleDataTypeApiType from "../../../../../model/SingleDataTypeApiType";
import CollectionMethodType from "../../../../../model/CollectionMethodType";
import Body from "../../../../common/fieldedit/Body";
import Footer from "../../../../common/fieldedit/Footer";
// import PatchMessage from "../../../../common/PatchMessage";

function transformValue(field: string, value: any) {
  if (field === "pids") {
    let sVal = Object.create(null);
    sVal["preferred"] = value["preferred"];
    if (value["preferred"] === StaticValues.DS_PID_CUSTOM) {
      sVal["urls"] = Object.create(null);
      sVal["urls"][StaticValues.DS_PID_CUSTOM] = value["urls"][StaticValues.DS_PID_CUSTOM];
    }
    return sVal;
  } else 
    return value;
}

interface DatasetFieldEditProps {
  singleDataId: string;
  oldValue: any;
  field: string;
  keycloakReady: boolean;
  fieldDisplay: string;
  showDialog: Function;
  singleDataType: SingleDataType;
}


function DatasetFieldEdit(props: DatasetFieldEditProps): JSX.Element {
  const [patchSingleData, {isError: isPatchError, isLoading: isPatchLoading, error: patchError } ] = usePatchSingleDataMutation();
  let [value, setValue] = useState<any>(props.oldValue);
  useEffect(() => setValue(props.oldValue), [props.oldValue]);
   let { keycloak } = useKeycloak();


  //console.log(`props.oldValue is ${JSON.stringify(props.oldValue)}`);
  //console.log(`dfe value is ${JSON.stringify(value)}`);
  const [isPatchValue, setIsPatchValue] = useState(false);
  const updValue = (newVal: any) => {setValue(newVal);};
  const patchDataset = () => {
    setIsPatchValue(true);
   
  }
  useEffect(() => {
    if (isPatchValue) {
      let sVal = transformValue(props.field, value);
        patchSingleData({
          token: keycloak.token,
          id: props.singleDataId, 
          property: SingleDataFactory.apiFieldName(props.field), 
          value: sVal, 
          singleDataType: props.singleDataType
        });
      //props.patchDataset(keycloak.token, props.datasetId, props.field, sVal);
     
    }
  }, [isPatchValue, setIsPatchValue, patchSingleData, value, keycloak, props]);

  useEffect(() => {
    if (isPatchValue) {
      // if (!isPatchLoading && !isPatchError) {        
      //   Dialog.HANDLE_CLOSE();
      // }
      if (!isPatchLoading) {
        setIsPatchValue(false);
        if (isPatchError) {
          Dialog.BODY_MESSAGE(new Message(Message.ERROR, "Update error", Util.getError(patchError).message));
        } else {
          Dialog.HANDLE_CLOSE();
        }
        
      } else {
        Dialog.BODY_MESSAGE(new Message(Message.INFO, "Updating, please wait..."));
      }
      
    }
  }, [isPatchError, isPatchLoading, patchError, Dialog.HANDLE_CLOSE]);
  // console.log(patchStatus);
  // const patchDatasetCb = (newData) => setData( prevValues => {
  //    return { ...prevValues, data: newData.data, isLoading: newData.isLoading, isLoaded: newData.isLoaded, error: newData.error, status: newData.status}}
  //  );
  
  
  return <Button title={`Edit field '${props.fieldDisplay}'`} variant="link" className="m-0 ms-1 me-1 p-0" onClick={() =>
      {
        let body: ReactNode | null = null;
        if (props.field === "license" || props.field === "licenseUrl") {
          body = <BodyLicense updValue={updValue} oldValue={props.oldValue} keycloakReady={props.keycloakReady} 
                  singleDataId={props.singleDataId} singleDataType={props.singleDataType}/>;
        } else if (props.field === "pids") {
          body = <BodyPid updValue={updValue} oldValue={value} />;
        } else if (props.field === "previousId") {
          body = <BodyId updValue={updValue} oldValue={value} keycloakReady={props.keycloakReady}
            singleDataType={props.singleDataType}/>;
        } else if (props.field === "typeApi") {
          body = <BodyEnumSelect updValue={updValue} oldValue={value} allValues={Object.values(SingleDataTypeApiType)}/>;
        } else if (props.field === "collectionMethod") {
          body = <BodyEnumSelect updValue={updValue} oldValue={value} allValues={Object.values(CollectionMethodType)}/>;
        } else {
          body = <Body updValue={updValue} oldValue={props.oldValue} />;
        }
        const bodyFull = <>
            {/* <PatchMessage isPatchError={isPatchError} isPatchLoading={isPatchLoading} patchError={patchError}  /> */}
            {body}
          </>;
        props.showDialog({
          show: true,
          footer: <Footer updValue={updValue} patch={patchDataset} oldValue={props.oldValue} />,
          body: bodyFull,
          title: <span>Edit <b>{props.fieldDisplay}</b></span>,
          size: DialogSize.SIZE_LG,
          onBeforeClose: null
        });
        //patchDataset(props.field, props.newValue, props.succUpdCb);
      }} >
    <PencilFill />
  </Button>
}

export default DatasetFieldEdit;
