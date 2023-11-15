// const { sendVerificationCode } = require('./appoinment_request.js'); // appoinment_request.js dosyanızın yolunu düzenleyin
// const nodemailer = require('nodemailer');
// const sinon = require('sinon'); // Fonksiyon çağrılarını izlemek ve kontrol etmek için sinon kullanabilirsiniz
// const chai = require('chai'); // Import Chai


// describe('sendVerificationCode function', () => {
//     it('should send a verification email', () => {
//         // Sahte bir nodemailer transporter oluşturun
//         const fakeTransporter = {
//             sendMail: sinon.spy() // Fonksiyonun çağrılarını izlemek için sinon kullanılır
//         };

//         sinon.replace(nodemailer, 'createTransport', sinon.fake.returns(fakeTransporter));

//         // sendVerificationCode fonksiyonunu çağırın
//         sendVerificationCode('John', 'Doe', 'cezzar.ahmet@example.com');

//         // Sahte transporter üzerinde sendMail fonksiyonunun çağrılarını kontrol edin
//         sinon.assert.calledOnce(fakeTransporter.sendMail);
//         const callArgs = fakeTransporter.sendMail.getCall(0).args[0]; // İlk çağrının argümanlarını alın

//         // Doğru e-posta adresine doğru verileri gönderip göndermediğini kontrol edin
//         expect(callArgs.from).to.equal(process.env.EMAIL_USER);
//         expect(callArgs.to).to.equal('cezzar.ahmet@example.com');
//         expect(callArgs.subject).to.equal('Doğrulama Kodu');

//         // Diğer kontrol ve testleri burada ekleyebilirsiniz

//         // Son olarak sinon değişikliklerini geri alın
//         sinon.restore();
//     });
// });


const { isEmailValid } = require('./appoinment_request.js');
const request = require('supertest');
const express = require('express');
const app = express();
const { server } = require('./appoinment_request.js');
const { sendVerificationCode } = require('./appoinment_request.js');
const { sendEmail } = require('./appoinment_request.js');


const sinon = require('sinon');
const nodemailer = require('nodemailer');



// app.post('/submit', (req, res) => {
//     // The function from appointment_request.js goes here
// });

// describe('POST /submit', () => {
//     it('responds with json', async () => {
//         const req = { body: { name: 'John', surname: 'Doe', telNo: '1234567890', email: 'cezzar.ahmet@example.com', availableHours: '9-5' } };
//         const res = { render: jest.fn() };

//         await request(app)
//             .post('/submit')
//             .send(req.body)
//             .expect('Content-Type', /json/)
//             .expect(200);

//         expect(res.render).not.toHaveBeenCalledWith('index.ejs', { error: 'error' });
//     });
// });

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
    it('should send an email with a verification code', () => {
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
    it('should send an email to dentist with appointment information', () => {
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