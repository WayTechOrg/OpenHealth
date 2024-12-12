export enum ErrorCodeEnum {
  PostNotFoundError = 10000,

  MasterLostError = 20000,

  UserNotFoundError = 10010,
}

export const ErrorCode = Object.freeze<
  Record<ErrorCodeEnum, [string, string, number]>
>({
  [ErrorCodeEnum.PostNotFoundError]: ['post not found', '文章不存在', 404],
  [ErrorCodeEnum.MasterLostError]: ['master lost', '管理员不存在', 500],
  [ErrorCodeEnum.UserNotFoundError]: ['user not found', '用户不存在', 404],
})
