import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  const router = useRouter()

  if(router.isFallback) {
    return <div className={styles.post}>Carregando...</div>
  }

  const readingTime = post.data.content.reduce((count, section) => {
    const heading = section.heading.split(' ').length;
    const text = section.body
      .reduce((newText, { text }) => {
        newText = newText.concat(text);
        return newText;
      }, '')
      .split(' ').length;

    return count + text + heading;
  }, 0);

  return (
    <div className={commonStyles.common}>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <div className={styles.post}>
        <img src={post.data.banner.url} alt="post banner" />
        <main className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <FiCalendar /> 
              {format(new Date(post.first_publication_date), 'PP', {locale: ptBR})}
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
          {post.data.content.map(section => {
            return (
              <article key={section.heading}>
                <h2>{section.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(section.body),
                  }}
                ></div>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map((post) => ({
    params: {
      slug: post.uid
    }
  })) //generate static file on build for all posts just for this example

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient(params);
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      subtitle: response.data.subtitle,
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
