import type { Batch, AnyBatchDetail, FermentationLog } from '~/types'

interface BatchProfile {
  name: string
  url_name: string
}

interface PublicBatchData {
  batch: Batch
  batch_detail: AnyBatchDetail
  fermentation_logs: FermentationLog[]
  profile: BatchProfile
}

export const usePublicBatch = (batchId: string) => {
  const slug = useSubdomainSlug()
  const config = useRuntimeConfig()

  const { data, pending, error } = useAsyncData(
    `public-batch-${batchId}`,
    async () => {
      if (!slug) return null
      const res = await $fetch<{ data: PublicBatchData }>(
        `${config.public.apiBatchBase}/public/profiles/${slug}/batches/${batchId}`
      )
      return res.data
    },
    { server: false },
  )

  return {
    batch: computed(() => data.value?.batch ?? null),
    batchDetail: computed(() => data.value?.batch_detail ?? null),
    fermentationLogs: computed(() => data.value?.fermentation_logs ?? []),
    profile: computed(() => data.value?.profile ?? null),
    pending,
    error,
  }
}
