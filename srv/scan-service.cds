//@(requires: 'authenticated-user')
@OData.publish: true
service ScanService @(requires: 'any') {

  type BodySchema {
    type : String;
    schema : LargeString;
    urls: array of String;
  };

  type MessageResponse {
      message : String;
      status: String
  }

  @HTTP.POST
  action performScan (query: BodySchema) returns MessageResponse;

}
