const getstream = require('getstream');
const {StreamChat} = require('stream-chat');
const {v4: uuidV4} = require('uuid');
const UserFactory = require('../factories/user-factory');
const {
  UserLocation,
  UserLocationHistory,
  UserTopic,
  UserTopicHistory,
  UserFollowUser,
  UserFollowUserHistory,
  LogError,
  sequelize
} = require('../../src/databases/models');
const {phpArtisan} = require('../testutils');
const LocationFactory = require('../factories/location-factory');
const {CHANNEL_TYPE_TOPIC, ICON_TOPIC_CHANNEL} = require('../../src/utils');
const CryptoUtils = require('../../src/utils/crypto');

jest.spyOn(CryptoUtils, 'getAnonymousUsername').mockImplementation((userId) => {
  console.log('mock getAnonymousUsername', userId);
  return `anonim${userId}`;
});

const {registerProcess} = require('../../src/processes/registerv2-process');
const TopicsFactory = require('../factories/topics-factory');

const getstreamClient = getstream.connect();

beforeAll(async () => {
  await phpArtisan('migrate:fresh --seed');
});
afterAll(async () => {
  await sequelize.close();
});

describe('registerProcess', () => {
  let adminUser;
  let ownUser;
  let user2;
  let user3;

  const doneCallback = jest.fn();

  // run registerProcess
  beforeAll(async () => {
    adminUser = await UserFactory.state('admin').create();
    [ownUser, user2, user3] = await Promise.all([
      UserFactory.create({user_id: 'ownUser'}),
      UserFactory.create({user_id: 'user2'}),
      UserFactory.create({user_id: 'user3'}),
      UserFactory.create({user_id: 'admin_anonim', username: 'anonimadmin'}),
      UserFactory.create({user_id: 'ownUser_anonim', username: 'anonimownUser'}),
      UserFactory.create({user_id: 'user2_anonim', username: 'anonimuser2'}),
      UserFactory.create({user_id: 'user3_anonim', username: 'anonimuser3'}),
      UserFactory.create({user_id: 'user4_unrelated'}),
      TopicsFactory.create({topic_id: '1', name: 'Topic 1'}),
      TopicsFactory.create({topic_id: '2', name: 'Topic 2'}).catch((err) => console.log(err))
    ]);

    const user2Followed1 = await UserFactory.create({user_id: 'user2_followed1'});
    await UserFollowUser.create({
      user_id_follower: user2.user_id,
      user_id_followed: user2Followed1.user_id,
      follow_action_id: uuidV4()
    });

    await Promise.all([
      LocationFactory.create({
        location_id: '2',
        location_level: 'City',
        city: 'Location City 1',
        state: 'Location State 1',
        country: 'US'
      }),
      LocationFactory.create({
        location_id: '23',
        location_level: 'State',
        city: 'Location City 2',
        state: 'Location State 2',
        country: 'US'
      })
    ]);

    const job = {
      data: {
        userId: 'ownUser',
        anonUserId: 'ownUser_anon',
        follows: ['user2', 'user3'],
        topics: [
          {topic_id: '1', name: 'Topic 1'},
          {topic_id: '2', name: 'Topic 2'}
        ],
        locations: [{location_id: '2'}, {location_id: '23'}]
      }
    };

    await registerProcess(job, doneCallback);
  });

  it('running done callback with ok', () => {
    expect(doneCallback).toHaveBeenCalledWith(null, 'ok');
  });

  it('register user locations', async () => {
    await expect(
      UserLocation.count({where: {user_id: 'ownUser', location_id: ['2', '23']}})
    ).resolves.toBe(2);
    await expect(
      UserLocationHistory.count({
        where: {user_id: 'ownUser', location_id: ['2', '23'], action: 'in'}
      })
    ).resolves.toBe(2);
  });

  it('register user topics', async () => {
    await expect(
      UserTopic.count({where: {user_id: 'ownUser', topic_id: ['1', '2']}})
    ).resolves.toBe(2);
    await expect(
      UserTopicHistory.count({where: {user_id: 'ownUser', topic_id: ['1', '2']}, action: 'in'})
    ).resolves.toBe(2);
  });

  it('register UserFollowUser', async () => {
    await expect(
      UserFollowUser.count({
        where: {user_id_follower: 'ownUser', user_id_followed: ['user2', 'user3']}
      })
    ).resolves.toBe(2);
    await expect(
      UserFollowUserHistory.count({
        where: {
          user_id_follower: 'ownUser',
          user_id_followed: ['user2', 'user3'],
          action: 'in',
          source: 'onboarding'
        }
      })
    ).resolves.toBe(2);
  });

  it('follow default location', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'location:everywhere'}
    ]);
  });

  it('prepopulatedDm', async () => {
    const streamChatInstance = StreamChat.getInstance();
    for (const user of [adminUser, user2, user3]) {
      expect(streamChatInstance.channel).toHaveBeenCalledWith(
        'messaging',
        expect.any(String),
        expect.objectContaining({
          name: `${user.username}, ${ownUser.username}`,
          type_channel: 0,
          created_by_id: 'ownUser'
        })
      );
    }

    const channel = streamChatInstance.channel();

    for (const u of [adminUser, user2, user3]) {
      expect(channel.addMembers).toHaveBeenCalledWith(
        ['ownUser'],
        expect.objectContaining({
          text: expect.stringContaining(u.username),
          user_id: 'ownUser',
          only_to_user_show: 'ownUser',
          disable_to_user: false,
          channel_role: 'channel_moderator',
          is_add: true,
          system_user: 'ownUser',
          is_from_prepopulated: true,
          other_text: expect.stringContaining(ownUser.username)
        })
      );
      expect(channel.addMembers).toHaveBeenCalledWith(
        [u.user_id],
        expect.objectContaining({
          text: expect.stringContaining(ownUser.username),
          user_id: u.user_id,
          only_to_user_show: false,
          disable_to_user: 'ownUser',
          channel_role: 'channel_moderator',
          is_add: false,
          system_user: 'ownUser',
          is_from_prepopulated: true,
          other_text: expect.stringContaining(u.username)
        })
      );
    }
  });

  it('follow users', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:user2', target: 'user:ownUser'},
      {source: 'main_feed_following:user3', target: 'user:ownUser'},
      {source: 'main_feed_following:admin', target: 'user:ownUser'}
    ]);
  });

  it('follow anonymous users', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        {source: 'main_feed_following:admin', target: 'user_anon:ownUser_anon'},
        {source: 'main_feed_following:user2', target: 'user_anon:ownUser_anon'},
        {source: 'main_feed_following:user3', target: 'user_anon:ownUser_anon'}
      ])
    );
  });

  it('follow topics', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'topic:Topic 1'},
      {source: 'main_feed_following:ownUser', target: 'topic:Topic 2'}
    ]);
  });

  it('follow locations', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'location:location-city-1'},
      {source: 'main_feed_following:ownUser', target: 'location:location-state-2'},
      {source: 'main_feed_following:ownUser', target: 'location:us'}
    ]);
  });

  it('add user to topic channels', async () => {
    const streamChatInstance = StreamChat.getInstance();
    expect(streamChatInstance.createToken).toHaveBeenCalledWith('ownUser');

    const topics = ['Topic 1', 'Topic 2'];
    for (const topic of topics) {
      expect(streamChatInstance.channel).toHaveBeenCalledWith('topics', topic, {
        name: `#${topic}`,
        created_by_id: 'system',
        channel_type: CHANNEL_TYPE_TOPIC,
        channelImage: ICON_TOPIC_CHANNEL,
        channel_image: ICON_TOPIC_CHANNEL,
        image: ICON_TOPIC_CHANNEL
      });
      expect(streamChatInstance.channel().create).toHaveBeenCalled();
      expect(streamChatInstance.channel().addMembers).toHaveBeenCalledWith(['ownUser']);
    }
  });

  it('follow main feed topic', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        {source: 'main_feed_topic:ownUser', target: 'topic:Topic 1'},
        {source: 'main_feed_topic:ownUser', target: 'topic:Topic 2'}
      ])
    );
  });

  it('follow main feed following', async () => {
    expect(getstreamClient.followMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        {source: 'main_feed_following:ownUser', target: 'user_excl:user2'},
        {source: 'main_feed_following:ownUser', target: 'user_excl:user3'},
        {source: 'main_feed_following:ownUser', target: 'user_excl:admin'}
      ])
    );
  });

  it('sync feed per user process', async () => {
    // Sync Main Feed Following
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'user_excl:admin'},
      {source: 'main_feed_following:ownUser', target: 'user_excl:user2'},
      {source: 'main_feed_following:ownUser', target: 'user_excl:user3'},
      {source: 'main_feed_following:ownUser', target: 'user_excl:ownUser'}
    ]);
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'user_anon:admin_anonim'},
      {source: 'main_feed_following:ownUser', target: 'user_anon:user2_anonim'},
      {source: 'main_feed_following:ownUser', target: 'user_anon:user3_anonim'},
      {source: 'main_feed_following:ownUser', target: 'user_anon:ownUser_anonim'}
    ]);
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_following:ownUser', target: 'topic:Topic 1'},
      {source: 'main_feed_following:ownUser', target: 'topic:Topic 2'}
    ]);

    // Sync Main Feed F2
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      {source: 'main_feed_f2:ownUser', target: 'user:user2_followed1'}
    ]);

    // Sync Main Feed Broad
    expect(getstreamClient.followMany).toHaveBeenCalledWith([
      // NEED TO CONFIRM: should we follow own anonim user, and other related anonim user?
      {source: 'main_feed_broad:ownUser', target: 'user:admin_anonim'},
      {source: 'main_feed_broad:ownUser', target: 'user:ownUser_anonim'},
      {source: 'main_feed_broad:ownUser', target: 'user:user2_anonim'},
      {source: 'main_feed_broad:ownUser', target: 'user:user3_anonim'},
      {source: 'main_feed_broad:ownUser', target: 'user:user4_unrelated'}
    ]);
  });

  it('create LogError when finished', async () => {
    await expect(
      LogError.findOne({where: {message: 'done register process userId: ownUser'}})
    ).resolves.toBeDefined();
  });
});
