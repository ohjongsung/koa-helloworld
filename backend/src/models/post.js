const mongoose = require('mongoose');

const { Schema } = mongoose;

const Post = new Schema({
    title: String,
    body: String,
    tags: [String], // 문자열 배열
    publishedDate: {
        type: Date,
        default: new Date() // 현재 날짜를 기본 값으로 지정
    }
});

// 모델 생성
// 스키마 이름을 정해주면, 데이터베이스는 복수형으로 컬렉션 이름을 만든다. posts
module.exports = mongoose.model('Post', Post);