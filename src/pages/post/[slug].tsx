import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const readingTime = post.data.content.reduce((count, section) => {
    const heading = RichText.asText(section.heading).split(' ').length;
    const text = section.body
      .reduce((newText, { text }) => {
        newText = newText.concat(text);
        return newText;
      }, '')
      .split(' ').length;

    return count + text + heading;
  }, 0);

  return (
    <div className={styles.post}>
      <img src={post.data.banner.url} alt="post banner" />
      <h1>{post.data.title}</h1>
      <div className={styles.info}>
        <time>
          <FiCalendar /> {post.first_publication_date}
        </time>
        <span>
          <FiUser />
          {post.data.author}
        </span>
        <span>
          <FiClock />
          {Math.ceil(readingTime / 200)} min
        </span>
      </div>
      <article className={styles.content}>
        {post.data.content.map(section => {
          return (
            <div>
              <h2>{RichText.asText(section.heading)}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(section.body),
                }}
              ></div>
            </div>
          );
        })}
      </article>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient({});
  // const posts = await prismic.getByType(TODO);
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient(params);
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'PP',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60, //1 hour
  };
};
