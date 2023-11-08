// verificationCode.test.js

import { describe, it } from 'mocha'; // Test çerçevesini içe aktarın
import { expect } from 'chai'; // Testleri yazmak için chai kullanabilirsiniz
import { sendVerificationCode } from './appoinment_request.js'; // Modülünüzün yolunu belirtin

// Unit test
describe('sendVerificationCode', function() {
  it('should generate a verification code and send an email', function() {
    // Test için gerekli veriler
    const name = 'John';
    const surname = 'Doe';
    const email = 'test@example.com';

    // İşlevi çağırın
    const result = sendVerificationCode(name, surname, email);

    // Gerçek sonuçları kontrol edin
    // Örneğin, e-posta gönderme başarılı mı?
    expect(result).to.equal('Email sent: SUCCESS'); // Başarılı durumu doğrulayın

    // E-posta içeriği oluşturuldu mu?
    // Email içeriğini çıkarın ve expect ile kontrol edebilirsiniz
    // Örneğin, içerikte beklenen kod var mı?
    const emailContent = '...'; // E-posta içeriği burada
    expect(emailContent).to.include('Doğrulama Kodu:'); // Beklenen içeriği kontrol edin
  });
});
