// Dependencies
const { Contract } = require("fabric-contract-api");
const keys = require("./keys");

// Main Chaincode Class
class UserChainCode extends Contract {
  // Provide a custom name to refer to this smart contract

  /* ****** Contract Functions - Starts ***** */

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console

  // To validate if one hospital is not updating other hospital Records
  validateUpdater(ctx, initiator) {
    const initiatorID = ctx.clientIdentity.getX509Certificate();
    if (initiatorID.issuer.organizationName.trim() !== initiator) {
      throw new Error(
        "Not authorized to initiate the transaction: " +
          initiatorID.issuer.organizationName +
          " not authorised to initiate this transaction"
      );
    }
  }

  /**
   * Create User
   * @param ctx - The transaction Context object
   * @param role - Role of the user Patient/Tester/Doctor/Govt/Insurance
   * @param firstName - First Name of the user
   * @param lastName - Last Name Id of the user
   * @param gender - Gender of the user
   * @param dob - Date of Birth of the user
   * @param phone - Phone Number of the user
   * @param email - Email Id of the user
   * @param address - Address of the user
   * @param pinCode - Pin Code of the user
   */
  async addNewUser(
    ctx,
    role,
    firstName,
    lastName,
    gender,
    dob,
    phone,
    email,
    address,
    pinCode
  ) {
    // Reference
    // Payload
    // Check if user already exists
    // Check if data exists
    // Get All Users
    // First User
    // Convert the JSON object to a buffer and send it to blockchain for storage
    // Save in Blockchain
    // Return Added Data
  }

  /**
   * Get User Details
   * @param ctx - The transaction Context object
   * @param phone - User Phone Number
   */
  async getUserDetails(ctx, phone) {
    // Reference
    // Get User Data
    // Check if data exists
    // Parse Data into JSON
    // Response
  }

  /**
   * Update User Details
   * @param ctx - The transaction Context object
   * @param phone - User Phone Number
   * @param newDetailsPayload - New Details payload that needs to be updated. Example -> {address:abc}
   */
  async updateUserDetails(ctx, phone, newDetailsPayload) {
    // Reference
    // Get User Data
    // Check if data exists
    // Parse Data into JSON
    // Parse Data into JSON
    // Can not update below fields
    // Update Details
    // Convert the JSON object to a buffer and send it to blockchain for storage
    // Add in DB
    // Response
  }

  /**
   * Create Test
   * @param ctx - The transaction Context object
   * @param testId - Test Id
   * @param phone - Phone Number of the Patient
   * @param description - Test Description
   */
  async addNewTest(ctx, testId, phone, description) {
    // Reference
    let exsitingTestData;
    let dataBufferTest;
    let dataBufferPatientTestMapping;
    let newTestPayload;
    let patientTestMappingPayload;
    let patientTestMappingData;
    let patientData;
    let patientTestMappingKey = keys.testMapping(phone);
    let testDataKey = keys.testData(testId);
    let userDataKey = keys.userData(phone);
    let allTestDataKey = keys.allTestsData();
    let allTestData;
    let allTestsRequestPayload;
    let dataBufferAllTestData;

    // Payload
    newTestPayload = {
      testId: testId,
      phone: phone,
      description: description,
      status: "INITIATED",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: ctx.clientIdentity
        .getX509Certificate()
        .issuer.organizationName.trim(),
    };

    // Get Patient Data
    patientData = await ctx.stub.getState(userDataKey);

    // Check if phone Number is registered to Patient
    if (!patientData || patientData.toString().length <= 0) {
      throw new Error("No Data Found");
    }

    // Check for duplicate Test ID
    exsitingTestData = await ctx.stub.getState(testDataKey);
    if (!(!exsitingTestData || exsitingTestData.toString().length <= 0)) {
      throw new Error("Duplicate Test ID");
    }

    // Get All Tests
    allTestData = await ctx.stub.getState(allTestDataKey);

    // First User
    if (!allTestData || allTestData.toString().length <= 0) {
      allTestsRequestPayload = {
        testIds: [testDataKey],
      };
    } else {
      // After First User
      allTestsRequestPayload = JSON.parse(allTestData.toString());
      allTestsRequestPayload.testIds.push(testDataKey);
    }

    // Get Patient Previous Mapping Data
    patientTestMappingData = await ctx.stub.getState(patientTestMappingKey);

    // First Test
    if (
      !patientTestMappingData ||
      patientTestMappingData.toString().length <= 0
    ) {
      patientTestMappingPayload = {
        phone: patientTestMappingKey,
        testIds: [testDataKey],
      };
    } else {
      // After First Test
      patientTestMappingPayload = JSON.parse(patientTestMappingData.toString());
      patientTestMappingPayload.testIds.push(testDataKey);
    }

    // Convert the JSON object to a buffer and send it to blockchain for storage
    dataBufferTest = Buffer.from(JSON.stringify(newTestPayload));
    dataBufferPatientTestMapping = Buffer.from(
      JSON.stringify(patientTestMappingPayload)
    );
    dataBufferAllTestData = Buffer.from(JSON.stringify(allTestsRequestPayload));

    // Save in Blockchain
    await ctx.stub.putState(testDataKey, dataBufferTest);
    await ctx.stub.putState(
      patientTestMappingKey,
      dataBufferPatientTestMapping
    );
    await ctx.stub.putState(allTestDataKey, dataBufferAllTestData);

    // Return Added Data
    return newTestPayload;
  }

  /**
   * Update Test
   * @param ctx - The transaction Context object
   * @param testId - Test ID
   * @param newDetailsPayload - New Details payload that needs to be updated. Example -> {status:"COMPLETED"}
   */
  async updateTestDetails(ctx, testId, newDetailsPayload) {
    // Reference
    let testData;
    let dataBuffer;
    let testDataKey = keys.testData(testId);

    // Get User Data
    testData = await ctx.stub.getState(testDataKey);

    // Check if data exists
    if (!testData || testData.toString().length <= 0) {
      throw new Error("No Data Found");
    }

    // Parse Data into JSON
    testData = JSON.parse(testData.toString());

    // Validate if same org is updating the record
    this.validateUpdater(ctx, testData.createdBy);

    // Can not update if status is completed
    if (testData.status == "COMPLETED") {
      throw new Error("Can not update completed test");
    }

    // Parse Data into JSON
    newDetailsPayload = JSON.parse(newDetailsPayload);

    // Can not update Bewlo fields
    delete newDetailsPayload["testId"];
    delete newDetailsPayload["createdBy"];

    // Update Details
    for (let key in newDetailsPayload) {
      testData[key] = newDetailsPayload[key];
    }
    testData["updatedAt"] = new Date();

    // Convert the JSON object to a buffer and send it to blockchain for storage
    dataBuffer = Buffer.from(JSON.stringify(testData));

    // Add in DB
    await ctx.stub.putState(testDataKey, dataBuffer);

    // Response
    return JSON.stringify(testData);
  }

  /**
   * Get Test Details
   * @param ctx - The transaction Context object
   * @param testId - Test Id
   */
  async getTestDetails(ctx, testId) {
    // Reference
    // Get User Data
    // Check if data exists
    // Parse Data into JSON
    // Response
  }

  /**
   * Get Patient Test Details
   * @param ctx - The transaction Context object
   * @param phone - Patient Phone Number
   */
  async getPatientTestDetails(ctx, phone) {
    // Reference
    // Get User Data
    // Check if data exists
    // Parse Data into JSON
    // Iterate Over Test
    // Response
  }

  /**
   * Get All Users Data
   * @param ctx - The transaction Context object
   */
  async getAllUsersData(ctx) {
    // Reference
    // Get All Request Data
    // Check if data exists
    // Iterate Over Requests
    // Response
  }

  /**
   * Get All Test Data
   * @param ctx - The transaction Context object
   */
  async getAllTestData(ctx) {
    // Reference
    // Get All Request Data
    // Check if data exists
    // Iterate Over Requests
    // Response
  }

  /* ****** Contract Functions - Ends ***** */
}

module.exports = UserChainCode;
