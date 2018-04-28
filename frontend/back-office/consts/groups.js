const GROUPS_SET = {
    USERS: 'users',
    FOUNDATORS: 'foundators',
    ADMINISTRATORS: 'administrators',
    MODERATORS: 'moderators',
    PHYSICIANS: 'physicians',
};

const GROUPS_CAN_ADMIN = [
    GROUPS_SET.FOUNDATORS,
    GROUPS_SET.ADMINISTRATORS,
    GROUPS_SET.MODERATORS,
];

export {
    GROUPS_SET,
    GROUPS_CAN_ADMIN,
};
