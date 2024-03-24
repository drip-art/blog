import { useContext, useState } from 'react';
import {
  useCreateCommitMutation,
  useDocumentQuery
} from '@/graphql/generated';
import { useCMSSession } from '@/utils/Auth/hooks';
import { createCommit as createCommitApi } from '@/utils/createCommit';
import useOid from '@/utils/Hooks/useOid';
import Modal from '../Modal';
import { CMSContext } from '@/utils/Context';
import { TrashIcon } from '@brandonowens/elegant-ui';

type DeleteDocumentButtonProps = {
  slug: string
  disabled?: boolean
  onComplete?: () => void
  collection: string
  className?: string
}

const DeleteDocumentButton = ({
  slug,
  disabled = false,
  onComplete = () => {},
  collection,
  className
}: DeleteDocumentButtonProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { session } = useCMSSession()
  const [createCommit] = useCreateCommitMutation()
  const { repoOwner, repoSlug, repoBranch, contentPath, monorepoPath } =
    useContext(CMSContext)
  const fetchOid = useOid()

  // const { data: metadata } = useDocumentQuery({
  //   variables: {
  //     owner: repoOwner || session?.user?.login || '',
  //     name: repoSlug,
  //     filePath: `${repoBranch}:${
  //       monorepoPath
  //     }${contentPath}/metadata.json`
  //   },
  //   fetchPolicy: 'network-only'
  // })

  const deleteDocument = async (slug: string) => {
    setDeleting(true)
    try {
      const oid = await fetchOid()
      const owner = repoOwner || session?.user?.login || ''

      const capi = createCommitApi({
        message: `feat(${collection}): remove ${slug}`,
        owner,
        oid: oid ?? '',
        name: repoSlug,
        branch: repoBranch
      })

      // remove post markdown file
      capi.removeFile(
        `${
          monorepoPath
        }${contentPath}/${collection}/${slug}.mdx`
      )

      const input = capi.createInput()

      await createCommit({ variables: { input } })
      setShowDeleteModal(false)
      if (onComplete) onComplete()
    } catch (error) {}
  }

  return (
    <>
      <button
        onClick={() => setShowDeleteModal(true)}
        type="button"
        disabled={disabled}
        className={`z-10 inline-block text-gray-500 hover:bg-white focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm p-1.5 ${className}`}
        title="Delete document"
      >
        <span className="sr-only">Delete document</span>
        <TrashIcon />
      </button>
      {showDeleteModal && (
        <Modal title="Delete Document" close={() => setShowDeleteModal(false)}>
          <div className="space-y-6 p-6 text-left">
            <p className="text-base leading-relaxed text-gray-500">
              Are you sure you want to delete this document?
            </p>
            <p className="text-base leading-relaxed text-gray-500">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center space-x-2 rounded-b border-t p-6">
            <button
              type="button"
              className="flex rounded-lg bg-red-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none"
              onClick={() => {
                deleteDocument(slug)
              }}
            >
              {deleting ? (
                <>
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting
                </>
              ) : (
                'Delete'
              )}
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium focus:z-10 focus:outline-none focus:ring-4 order-gray-600 bg-gray-800 text-white hover:border-gray-600 hover:bg-gray-700 focus:ring-gray-700"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DeleteDocumentButton
