//@(requires: 'authenticated-user')
@OData.publish: true
service ScanService @(requires: 'any') {

  type BodySchema {
    type : String;
    schema : LargeString;
    urls: array of String;
    base64:array of LargeString;
    processingType: String;
  };

  type DocumentScanResult {
    nombreDocumento: String;
    datos: LargeString; // Cambia a una estructura si sabes el formato
  };

  @HTTP.POST
  action performScan(query: BodySchema) returns array of DocumentScanResult;

}
