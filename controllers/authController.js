const path = require('path');
const fs = require('fs'); // Node.js의 파일 시스템 모듈 불러오기

// 구글 로그인 페이지를 보여주는 함수
exports.showGoogleLoginPage = (req, res) => {
    // google.html 파일의 절대 경로를 계산합니다.
    const filePath = path.join(__dirname, '../web/auth/google.html');

    // 파일을 텍스트 형식(utf8)으로 읽습니다.
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // 파일을 읽는 중 오류가 발생하면 500 에러를 보냅니다.
            console.error('파일을 읽을 수 없습니다:', err);
            return res.status(500).send('서버 오류가 발생했습니다.');
        }

        // GOOGLE_CLIENT_ID가 .env 파일에 설정되어 있는지 확인합니다.
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('.env 파일에 GOOGLE_CLIENT_ID가 설정되지 않았습니다.');
            return res.status(500).send('서버 설정 오류: 클라이언트 ID가 없습니다.');
        }

        // 파일 내용(data)에서 '__GOOGLE_CLIENT_ID__' 부분을
        // .env 파일에 저장된 실제 클라이언트 ID 값으로 교체합니다.
        const result = data.replace('__GOOGLE_CLIENT_ID__', process.env.GOOGLE_CLIENT_ID);

        // 값이 교체된 최종 HTML 텍스트를 브라우저에게 보냅니다.
        res.send(result);
    });
};

// 구글 로그인 후 콜백을 처리하는 함수
exports.handleGoogleCallback = (req, res) => {
    // 인증 성공 후, 사용자에게 보여줄 간단한 콜백 페이지를 보냅니다.
    // 이 페이지는 "인증 성공" 같은 메시지를 보여주거나, 토큰을 처리하는 스크립트를 담을 수 있습니다.
    const callbackFilePath = path.join(__dirname, '../web/auth/google.html');
    res.sendFile(callbackFilePath);
};

