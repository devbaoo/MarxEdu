import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  InputNumber,
  List,
  Pagination,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
} from "@/services/store/store";
import {
  clearRandomFlashcards,
  fetchFlashcardTags,
  fetchFlashcards,
  fetchRandomFlashcards,
} from "@/services/features/flashcard/flashcardSlice";
import { IFlashcard } from "@/interfaces/IFlashcard";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { CheckableTag } = Tag;

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_RANDOM_LIMIT = 5;

const FlashcardsPage = () => {
  const dispatch = useAppDispatch();
  const {
    flashcards,
    loading,
    error,
    pagination,
    tags,
    tagsLoading,
    randomFlashcards,
    randomLoading,
    randomError,
  } = useAppSelector((state) => state.flashcard);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [randomLimit, setRandomLimit] = useState(DEFAULT_RANDOM_LIMIT);

  useEffect(() => {
    dispatch(fetchFlashcardTags());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchFlashcards({
        tag: selectedTag || undefined,
        search: appliedSearch || undefined,
        page: currentPage,
        limit: pageSize,
      })
    );
  }, [dispatch, selectedTag, appliedSearch, currentPage, pageSize]);

  const handleSearch = (value: string) => {
    setAppliedSearch(value.trim());
    setCurrentPage(1);
  };

  const handleAllTags = (checked: boolean) => {
    if (checked) {
      setSelectedTag(null);
      setCurrentPage(1);
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTag(checked ? tag : null);
    setCurrentPage(1);
  };

  const handleChangePage = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const handleRandomFetch = () => {
    if (!randomLimit || randomLimit <= 0) {
      return;
    }

    dispatch(
      fetchRandomFlashcards({
        tag: selectedTag || undefined,
        limit: randomLimit,
      })
    );
  };

  useEffect(() => {
    return () => {
      dispatch(clearRandomFlashcards());
    };
  }, [dispatch]);

  const paginationMeta = useMemo(() => {
    if (!pagination) {
      return {
        total: 0,
        totalPages: 0,
      };
    }

    return {
      total: pagination.total || flashcards.length,
      totalPages: pagination.totalPages || 0,
    };
  }, [pagination, flashcards.length]);

  const renderFlashcard = (flashcard: IFlashcard) => (
    <Card
      key={flashcard.id}
      title={flashcard.front}
      bordered
      className="shadow-sm"
    >
      <Paragraph className="text-gray-700 whitespace-pre-line">
        {flashcard.back}
      </Paragraph>
      {flashcard.tags && flashcard.tags.length > 0 && (
        <Space size={[8, 8]} wrap className="mt-2">
          {flashcard.tags.map((tag) => (
            <Tag key={`${flashcard.id}-${tag}`}>{tag}</Tag>
          ))}
        </Space>
      )}
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={2} className="m-0">
            🧠 Bộ Flashcards Triết học Mác-Lênin
          </Title>
          <Text type="secondary">
            Ôn tập nhanh các khái niệm trọng tâm với các thẻ ghi nhớ được phân loại theo chủ đề.
          </Text>
        </div>
        <Space align="center" className="mt-2 sm:mt-0">
          <InputNumber
            min={1}
            max={50}
            value={randomLimit}
            onChange={(value) => setRandomLimit(value ?? DEFAULT_RANDOM_LIMIT)}
            formatter={(value) => `${value}`}
            parser={(value) => Number(value || DEFAULT_RANDOM_LIMIT)}
            size="middle"
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={randomLoading}
            onClick={handleRandomFetch}
          >
            Luyện ngẫu nhiên
          </Button>
        </Space>
      </div>

      <Card className="shadow-sm">
        <Space direction="vertical" size="large" className="w-full">
          <Search
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
            enterButton={<SearchOutlined />}
            value={searchValue}
            allowClear
            onChange={(event) => setSearchValue(event.target.value)}
            onSearch={handleSearch}
            size="large"
          />

          <div>
            <Space size={[8, 8]} wrap>
              <CheckableTag
                checked={!selectedTag}
                onChange={handleAllTags}
              >
                Tất cả
              </CheckableTag>
              {tagsLoading ? (
                <Spin size="small" />
              ) : (
                tags.map((tag) => (
                  <CheckableTag
                    key={tag.tag}
                    checked={selectedTag === tag.tag}
                    onChange={(checked) => handleTagChange(tag.tag, checked)}
                  >
                    {tag.tag} ({tag.count})
                  </CheckableTag>
                ))
              )}
            </Space>
          </div>
        </Space>
      </Card>

      {randomError && (
        <Alert type="error" showIcon message={randomError} />
      )}

      {randomFlashcards.length > 0 && (
        <Card
          title="🎲 Bộ flashcard ngẫu nhiên"
          className="shadow-sm"
          extra={
            <Button type="link" onClick={() => dispatch(clearRandomFlashcards())}>
              Ẩn
            </Button>
          }
        >
          <List
            dataSource={randomFlashcards}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
            renderItem={(item) => (
              <List.Item>{renderFlashcard(item)}</List.Item>
            )}
          />
        </Card>
      )}

      <Card className="shadow-sm" title="📚 Danh sách Flashcards">
        {error && <Alert type="error" showIcon className="mb-4" message={error} />}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin tip="Đang tải flashcards..." />
          </div>
        ) : flashcards.length === 0 ? (
          <Empty description="Không tìm thấy flashcard phù hợp" />
        ) : (
          <List
            dataSource={flashcards}
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
            renderItem={(item) => (
              <List.Item>{renderFlashcard(item)}</List.Item>
            )}
          />
        )}

        <Divider />
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={paginationMeta.total}
          showSizeChanger
          pageSizeOptions={["10", "20", "50", "100"]}
          onChange={handleChangePage}
          onShowSizeChange={handleChangePage}
          showTotal={(total) => `${total} flashcard`}
        />
      </Card>
    </div>
  );
};

export default FlashcardsPage;
