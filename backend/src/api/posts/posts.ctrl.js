const Post = require('models/post');
const Joi = require('joi');
const {ObjectId} = require('mongoose').Types;

exports.checkObjectId = (ctx, next) => {
    const {id} = ctx.params;

    if (!ObjectId.isValid(id)) {
        ctx.status = 404;
        return null;
    }

    return next();
};

/**
 * 포스트 작성
 * POST /api/posts
 * { title, body, tags }
 */
exports.write = async (ctx) => {
    // 객체가 지닌 값들을 검증
    const schema = Joi.object().keys({
        // required() 필수 항목이라는 의미
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required()
    });

    const result = Joi.validate(ctx.request.body, schema);
    if (result.error) {
        ctx.status = 404;
        ctx.body = result.error;
        return;
    }

    const {title, body, tags} = ctx.request.body;

    const post = new Post({
        title, body, tags
    });

    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(e, 500);
    }
};

/**
 * 포스트 목록 조회
 * GET /api/posts
 */
exports.list = async (ctx) => {
    try {
        // page 가 없으면 1로 간주
        // query 는 문자열 형태로 받아 오므로 숫자로 변환
        const page = parseInt((ctx.query.page || 1));
        console.log(page);
        if (page < 1) {
            ctx.status = 400;
            return;
        }

        const posts = await Post.find()
            .sort({_id: -1})
            .limit(10)
            .skip((page - 1) * 10)
            .lean() // exec 전에 lean() 삽입
            .exec();
        // 길이 체크 후, 자르는 함수
        const limitBodyLength = post => ({
            ...post,
            body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`
        });
        // 배열의 map 함수로 limitBodyLength 적용
        ctx.body = posts.map(limitBodyLength);
    } catch (e) {
        ctx.throw(e, 500);
    }
};

/**
 * 특정 포스트 조회
 * GET /api/posts/:id
 */
exports.read = async (ctx) => {
    const {id} = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(e, 500);
    }
};

/**
 * 특정 포스트 제거
 * DELETE /api/posts/:id
 */
exports.remove = async (ctx) => {
    const {id} = ctx.params;
    try {
        await Post.findByIdAndDelete(id).exec();
        ctx.status = 204;
    } catch (e) {
        ctx.throw(e, 500);
    }
};

/**
 * 포스트 수정(특정 필드 변경)
 * PATCH /api/posts/:id
 * { title, body }
 */
exports.update = async (ctx) => {
    const {id} = ctx.params;
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            // 이 값을 설정해야 업데이트된 객체를 반환한다.
            // 설정하지 않으면 업데이트되기 전의 객체를 반환한다.
            new: true
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(e, 500);
    }
};