import Avatar from "avatar-builder";

async function createAvatar(email) {
  const avatar = Avatar.catBuilder(128);
  const contactAvatar = await avatar.create(email);
  return contactAvatar;
  //   return contactAvatar.Cache.folder("../../tmp");
}

export default createAvatar;
