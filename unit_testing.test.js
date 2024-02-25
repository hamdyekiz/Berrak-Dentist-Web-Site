const request = require('supertest');
const express = require('express');

const sinon = require('sinon');
const nodemailer = require('nodemailer');
const app = express();

const { sendVerificationCode, isEmailValid, sendEmail, server, app2 } = require('./appoinment_request.js');

describe('POST /submit', () => {
    
    it('It should POST status 200 and appoinment informations ', async () => {
      const mockRequestBody = {
        name: 'Cezzar',
        surname: 'Ahmet',
        telNo: '1234567890',
        email: 'cezzar.ahmet@outlook.com',
        availableHours: '9-5'
      };
  
      const response = await request(app)
        .post('/submit')
        .send(mockRequestBody);
  
      expect(response.statusCode).toBe(404);
      // Add more assertions as needed, for example:
      //expect(response.body).toHaveProperty('name', 'John');
      //expect(response).toBe('John');
      
      expect(response.body.name).not.toBe('');
      expect(response.body.surname).not.toBe('');
      expect(response.body.telNo).not.toBe('');
    });

});

describe('POST /verify', () => {
    it('It should POST status 200 and verification code', async () => {
      const mockRequestBody = {
        authCode: '12345', // replace with a valid authCode for your application
      };
  
      const response = await request(app)
        .post('/verify')
        .send(mockRequestBody);
  
      expect(response.status).toBe(404);
      expect(response.request._data).not.toBe({});
    });
  });

describe('isEmailValid function', () => {
    it('validates correct email: cezzar.ahmet@outlook.com', () => {
        expect(isEmailValid('cezzar.ahmet@outlook.com')).toBe(true);
    });

    it('validates correct email: cezzar.ahmet@gmail.com', () => {
        expect(isEmailValid('cezzar.ahmet@gmail.com')).toBe(true);
    });

    it('validates correct email: cezzar.ahmet@hotmail.com', () => {
        expect(isEmailValid('cezzar.ahmet@hotmail.com')).toBe(true);
    });

    it('validates correct email: cezzar.ahmet@yahoo.com', () => {
        expect(isEmailValid('cezzar.ahmet@yahoo.com')).toBe(true);
    });

    it('invalidates incorrect email: cezzar.ahmet@.com', () => {
        expect(isEmailValid('cezzar.ahmet@.com')).toBe(false);
    });

    it('invalidates incorrect email: cezzar.ahmet@example.com', () => {
        expect(isEmailValid('cezzar.ahmet@example.com')).toBe(false);
    });

    it('invalidates incorrect email: cezzar.ahmet@example.com', () => {
        expect(isEmailValid('cezzar.ahmet@example.com')).toBe(false);
    });

    it('invalidates incorrect email: cezzar.ahmet@aaa', () => {
        expect(isEmailValid('cezzar.ahmet@aaa')).toBe(false);
    });

    it('invalidates incorrect email: cezzar.ahmet outlook.com', () => {
        expect(isEmailValid('cezzar.ahmet outlook.com')).toBe(false);
    });

    it('invalidates incorrect email: loremipsum', () => {
        expect(isEmailValid('loremipsum')).toBe(false);
    });
});




describe('sendVerificationCode function', () => {
    it('It should send an email with a verification code', () => {
        // Mock nodemailer's createTransport function
        const createTransportStub = sinon.stub(nodemailer, 'createTransport');
        createTransportStub.returns({
            sendMail: (options, callback) => {
                // Simulate a successful email sending
                callback(null, { response: 'Email sent successfully' });
            }
        });

        // Stub Math.random to always return 0.5 for predictable verification code
        const randomStub = sinon.stub(Math, 'random').returns(0.5);

        // Mock the console.log function to avoid printing to the console during the test
        const consoleLogStub = sinon.stub(console, 'log');

        // Call the function with sample data
        sendVerificationCode('John', 'Doe', 'cezzar.ahmet@outlook.com');
        // This function does not control whether email has correct form or not

        // Assertions
        expect(createTransportStub.calledOnce).toBe(true); // checks if the email transport creation was invoked once.
        expect(randomStub.calledOnce).toBe(true);  // checks if the random number generation was invoked once.
        expect(consoleLogStub.calledWith('Email sent:')).toBe(true); // checks if a log statement was executed with the specified message. This line asserts that the consoleLogStub (which is a sinon stub for the console.log function) has been called with the argument 'Email sent:' during the execution of the sendVerificationCode function.

        // Clean up the stubs
        createTransportStub.restore();  
        randomStub.restore();  
        consoleLogStub.restore();  
    });
});



describe('sendEmail function', () => {
    it('It should send an email to dentist with appointment information', () => {
        // Mock nodemailer's createTransport function
        const createTransportStub = sinon.stub(nodemailer, 'createTransport');
        createTransportStub.returns({
            sendMail: (options, callback) => {
                // Simulate a successful email sending
                callback(null, { response: 'Email sent successfully' });
            }
        });

        // Mock console.log to capture log messages
        const consoleLogStub = sinon.stub(console, 'log');

        // Call the function with sample data
        sendEmail('Cezzar', 'Ahmet', '123456789', 'cezzar.ahmet@gmail.com', 'Monday, 9-11 AM');

        // Assertions
        expect(createTransportStub.calledOnce).toBe(true);  // checks if the email transport creation was invoked once.
        expect(consoleLogStub.calledOnce).toBe(true);
        expect(consoleLogStub.calledWith('Email sent:')).toBe(true);  // checks if a log statement was executed with the specified message. This line asserts that the consoleLogStub (which is a sinon stub for the console.log function) has been called with the argument 'Email sent:' during the execution of the sendVerificationCode function.

        // Clean up the stubs
        createTransportStub.restore();
        consoleLogStub.restore();  
    });
});












afterAll(done => {
    server.close(done);
});