const UsersFunction = {
    register: require('./users-register'),
    registerAnonymous: require('./users-register-anonymous'),
    getUserTopicList: require('./get-user-topic-list'),
    getUserFollowingList: require('./get-user-following-list'),
    getUserByUserId: require('./get-user-by-user-id')
}

module.exports = UsersFunction;