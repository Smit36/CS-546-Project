const $tripNotifications = $("#trip-notifications");
const getUserId = () => $("#user-id").html().trim();

if ($tripNotifications[0]) {
  const UPDATE_SEEN_STORAGE = "seen-trip-updates";
  const getUpdateSeen = () =>
    JSON.parse(localStorage.getItem(UPDATE_SEEN_STORAGE) || '{}');
  const setUpdateSeen = (updateSeen) =>
    localStorage.setItem(UPDATE_SEEN_STORAGE, JSON.stringify(updateSeen));

  const getUserUpdateSeen = () => {
    const seenUpdates = getUpdateSeen();
    const userId = getUserId();
    return seenUpdates[userId] || {};
  };

  const setUserUpdateSeen = (updateId) => {
    const updateSeen = getUpdateSeen();
    const userId = getUserId();
    updateSeen[userId] = updateSeen[updateId] || {};
    updateSeen[userId][updateId] = true;
    setUpdateSeen(updateSeen);
    return updateSeen;
  };

  const $createNotificationItem = (trip) => {
    const { name, approval, approvalId } = trip;
    const { status, updates } = approval;
    const lastUpdate = updates[updates.length - 1];
    const link = `/approval/${approvalId}`;
    const $message = $("<a>")
      .text(`[${status}] ${name}`)
      .prop("href", link)
      .click((e) => {
        e.preventDefault();
        setUserUpdateSeen(lastUpdate._id);
        window.location.replace(link);
      });
    const $item = $("<li>").append($message);
    return $item;
  };

  const $createNotificationList = (trips) => {
    const $list = $("<ul>");
    for (const trip of trips) {
      const $item = $createNotificationItem(trip);
      $list.append($item);
    }
    return $list;
  };

  $.get("/trip/notifications", ({ trips }) => {
    const userUpdateSeen = getUserUpdateSeen();
    
    const unseenTrips = trips.filter(({ approval }) => {
      const { updates } = approval;
      const lastUpdate = updates[updates.length - 1];
      return !userUpdateSeen[lastUpdate._id];
    })
    
    if (unseenTrips.length > 0) {
      $tripNotifications.empty();
      const $summary = $("<div>").text(
        `${unseenTrips.length} trip approval updates to review.`
      );
      $tripNotifications.append($summary);
      const $list = $createNotificationList(unseenTrips);
      $tripNotifications.append($list);
    }
  });
}
