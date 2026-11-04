import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { fetchProfileApi, type ProfileDto } from '../api/profile';

/**
 * Hook truy vấn thông tin hồ sơ người dùng / sinh viên
 */
export function useProfileQuery(options?: Partial<UseQueryOptions<ProfileDto, Error>>) {
  return useQuery<ProfileDto, Error>({
    queryKey: queryKeys.profile.current(),
    queryFn: fetchProfileApi,
    ...options,
  });
}

