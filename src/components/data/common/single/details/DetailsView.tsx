import React, { Fragment } from "react";
import { Container, Row, Col} from 'react-bootstrap';
import { useKeycloak } from "@react-keycloak/web";
import StaticValues from "../../../../../api/StaticValues";
import DatasetFieldEdit from "../common/DatasetFieldEdit";
import DatasetDetailsBox from "./DatasetDetailsBox";
import MessageBox from "./MessageBox";
import SingleData from "../../../../../model/SingleData";
import LoadingView from "../../../../common/LoadingView";
import ErrorView from "../../../../common/ErrorView";
import NoDataView from "../../../../common/NoDataView";
import { useGetSingleDataQuery } from "../../../../../service/singledata-api";
import SingleDataType from "../../../../../model/SingleDataType";
import License from "../../../../../model/License";
import Util from "../../../../../Util";

interface DetailsViewProps<T extends SingleData> {
  showDialog: Function;
  keycloakReady: boolean;
  singleDataId: string;
  singleDataType: SingleDataType;
}

function DetailsView<T extends SingleData>(props: DetailsViewProps<T>) {
  const { keycloak } = useKeycloak();


  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useGetSingleDataQuery({
      token: keycloak.token,
      id: props.singleDataId,
      singleDataType: props.singleDataType
    }
  )

  // let ageLstItem = <span>-</span>;
  // if (dataset.ageLow != null && dataset.ageHigh != null) {
  //   ageLstItem = <span>Between {dataset.ageLow} {dataset.ageUnit[0]} and {dataset.ageHigh} {dataset.ageUnit[1]}</span>
  // } else if (dataset.ageLow != null)  {
  //   ageLstItem = <span>Greater than {dataset.ageLow} {dataset.ageUnit[0]}</span>
  // } else if (dataset.ageHigh != null)  {
  //   ageLstItem = <span>Less than {dataset.ageHigh} {dataset.ageUnit[1]}</span>

  // }
  if (dataset) {
    let pids = dataset.pids;
    let pidUrl: string = "";
    //let pidsPatch = Object.create(null);
    //pidsPatch["preferred"] = pids["preferred"];
    if (pids["preferred"] === StaticValues.DS_PID_ZENODO) {
      pidUrl = pids.urls.zenodoDoi ?? "";
      ///pidsPatch[pids["preferred"]] = pids["url"]
    } else if (pids["preferred"] === StaticValues.DS_PID_CUSTOM) {
      pidUrl = pids.urls.custom ?? "";
    }

    return(
      <Container fluid>
        <Row>
          <MessageBox keycloakReady={props.keycloakReady} 
            dataset={dataset}/>
        </Row>

        <Row>
          <Col md={8}>
            <p>
              <b className="h5">Purpose</b>
              {
                keycloak.authenticated &&  dataset.editablePropertiesByTheUser.includes("purpose")
                ? <DatasetFieldEdit singleDataId={props.singleDataId} singleDataType={props.singleDataType}
                    showDialog={props.showDialog} field="purpose" fieldDisplay="Dataset purpose"
                    oldValue={dataset.purpose} keycloakReady={props.keycloakReady}/>
                : <Fragment />
              }
              <br></br>
              <span className="ms-4" dangerouslySetInnerHTML={{ __html: dataset.purpose }}></span>

            </p>
            <p>
              <b className="h5">Description</b>
              {
                keycloak.authenticated &&  dataset.editablePropertiesByTheUser.includes("description")
                ? <DatasetFieldEdit singleDataId={props.singleDataId} singleDataType={props.singleDataType}
                    showDialog={props.showDialog} field="description" fieldDisplay="Dataset description"
                    oldValue={dataset.description} keycloakReady={props.keycloakReady}/>
                : <Fragment />
              }
              <br></br>
              <span className="ms-4" dangerouslySetInnerHTML={{ __html: dataset.description }}></span>
              
            </p>

            <p>
            <b className="h5">Contact Information</b>
                  { keycloak.authenticated &&  dataset.editablePropertiesByTheUser.includes("contactInfo") ?
                        <DatasetFieldEdit  singleDataId={props.singleDataId} singleDataType={props.singleDataType}
                          showDialog={props.showDialog} field="contactInfo" fieldDisplay="Contact information" 
                          oldValue={dataset.contactInfo} keycloakReady={props.keycloakReady}/>
                      : <Fragment /> }
            <br></br>
              <span className="ms-4">{dataset.contactInfo}</span>
            </p>
            <div className="pt-2 pb-2 ps-1 pe-1 bg-light bg-gradient">
              <p>
              { pidUrl.length > 0 ?
                <Fragment><i>Cite this dataset as </i><b><a target="_blank" href={pidUrl}>{pidUrl}</a></b></Fragment> : 
                  (dataset.editablePropertiesByTheUser.includes("pids") ? <i>Add a PID URL to allow citations </i> : <Fragment/> ) }

              { keycloak.authenticated &&  dataset.editablePropertiesByTheUser.includes("pids") ?
                        <DatasetFieldEdit singleDataId={props.singleDataId} singleDataType={props.singleDataType} 
                            showDialog={props.showDialog} field="pids" 
                            fieldDisplay="Permanent ID (PID) URL"
                            oldValue={pids} keycloakReady={props.keycloakReady}/>
                        : <Fragment/>
              }            
              </p>
              <p>
                {
                  dataset.license === null || dataset.license.title === null || dataset.license.title.length === 0
                    || dataset.license.url === null || dataset.license.url.length === 0 ?
                    (
                      dataset.editablePropertiesByTheUser.includes("license")  ?
                        <i>Add a license </i> : <i>The dataset license has yet to be set.</i>
                    )
                    : 
                    <Fragment>
                      <i>This dataset is offered under the following license: </i>
                      <b><a target="_blank" href={dataset.license.url}>{dataset.license.title}</a></b>
                    </Fragment>
                }
                
                { keycloak.authenticated &&  dataset.editablePropertiesByTheUser.includes("license")  ?
                            <DatasetFieldEdit singleDataId={props.singleDataId} singleDataType={props.singleDataType} 
                                showDialog={props.showDialog} 
                                field={dataset.editablePropertiesByTheUser.includes("license") ? "license" : "licenseUrl"} 
                                fieldDisplay="Dataset license" oldValue={dataset.license ?? new License()}
                               keycloakReady={props.keycloakReady}  />
                          : <Fragment /> }
              </p>
              <p>
                {
                  dataset.lastIntegrityCheck ? 
                    <i>Last integrity check performed on <b>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'long' }).format(Date.parse(dataset.lastIntegrityCheck))}</b>.</i>
                    : <i>The integrity of the dataset has not been checked yet.</i>
                  }
              </p>
              <p>
                {
                  dataset.sizeInBytes ? 
                    <i>This dataset occupies <b>{Util.formatBytes(dataset.sizeInBytes)}</b> of storage space.</i>
                    : <i>The amount of storage space that this dataset uses is not currently known.</i>
                  }
              </p>
            </div>
          </Col>
          <Col md={4}>
            <DatasetDetailsBox showDialog={props.showDialog} keycloakReady={props.keycloakReady} 
              singleDataId={props.singleDataId}  singleDataType={props.singleDataType}
            />
          </Col>
        </Row>
      </Container>
    );
  } else { // data is null
    if (datasetLoading) {
      return <LoadingView what=" the general information"></LoadingView>
    } else {
      if (datasetError) {
        return <ErrorView message="Error loading data." />
      }
    }
  }
  return <NoDataView message="No data found in the details tab."></NoDataView>;
}

export default DetailsView;
