const { ObjectId } = require("mongodb");
const { stringifyObjectId } = require("../utils/mongodb");
const { createRank } = require("../data/rank");


const seedRanks = async ({
    timestamp1 = new Date().getTime(),
    timestamp2 = new Date().getTime(),
    timestamp3 = new Date().getTime(),
    corporateId1 = new ObjectId(),
    corporateId2 = new ObjectId(),
    rankId1 = new ObjectId(),
    rankId2 = new ObjectId(),
    rankId3 = new ObjectId(),
    rankId4 = new ObjectId(),
    rankId5 = new ObjectId(),
    rankId6 = new ObjectId(),

} = {}) => {
    const rankData1 = {
        _id: rankId1,
        corporateId: corporateId1,
        name : 'Manager',
        level: 3,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const rankData2 = {
        _id: rankId2,
        corporateId: corporateId1,
        name : 'Accountant',
        level: 2,
        createdAt: timestamp2,
        updatedAt: timestamp2,
    };

    const rankData3 = {
        _id: rankId3,
        corporateId: corporateId1,
        name : 'Associate',
        level: 1,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const rankData4 = {
        _id: rankId4,
        corporateId: corporateId2,
        name : 'Tech Lead',
        level: 3,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const rankData5 = {
        _id: rankId5,
        corporateId: corporateId2,
        name : 'Senior Developer',
        level: 2,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const rankData6 = {
        _id: rankId6,
        corporateId: corporateId2,
        name : 'Developer',
        level: 1,
        createdAt: timestamp1,
        updatedAt: timestamp1,
    };

    const rank1 = createRank(rankData1);
    const rank2 = createRank(rankData2);
    const rank3 = createRank(rankData3);
    const rank4 = createRank(rankData4);
    const rank5 = createRank(rankData5);
    const rank6 = createRank(rankData6);

    return {
        rank1,
        rank2,
        rank3,
        rank4,
        rank5,
        rank6,
    };
};

module.exports = seedRanks;


